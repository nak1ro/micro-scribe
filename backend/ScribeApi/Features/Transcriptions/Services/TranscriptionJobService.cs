using System.Data;
using Hangfire;
using Hangfire.States;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ScribeApi.Core.Domain.Plans;
using ScribeApi.Core.Exceptions;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Webhooks.Contracts;
using ScribeApi.Infrastructure.BackgroundJobs;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Services;

public class TranscriptionJobService : ITranscriptionJobService
{
    private readonly AppDbContext _context;
    private readonly ITranscriptionJobQueries _queries;
    private readonly IPlanResolver _planResolver;
    private readonly IPlanGuard _planGuard;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly IWebhookService _webhookService;
    private readonly ILogger<TranscriptionJobService> _logger;

    public TranscriptionJobService(
        AppDbContext context,
        ITranscriptionJobQueries queries,
        IPlanResolver planResolver,
        IPlanGuard planGuard,
        IBackgroundJobClient backgroundJobClient,
        IWebhookService webhookService,
        ILogger<TranscriptionJobService> logger)
    {
        _context = context;
        _queries = queries;
        _planResolver = planResolver;
        _planGuard = planGuard;
        _backgroundJobClient = backgroundJobClient;
        _webhookService = webhookService;
        _logger = logger;
    }

    public async Task<TranscriptionJobResponse> StartJobAsync(string userId, CreateTranscriptionJobRequest request,
        CancellationToken ct)
    {
        // Use Serializable transaction to prevent race conditions on limits and duplicate jobs
        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            var mediaFileId = await ResolveAndValidateMediaFileAsync(userId, request, ct);

            await EnsureNoPendingJobsAsync(mediaFileId, userId, ct);
            await EnsurePlanLimitsAsync(userId, ct);

            var job = await CreateAndPersistJobAsync(userId, mediaFileId, request, ct);

            await transaction.CommitAsync(ct);

            // Enqueue after commit to ensure job exists for worker
            EnqueueBackgroundJob(job.Id, await GetUserPlanAsync(userId, ct));

            return new TranscriptionJobResponse(job.Id, job.MediaFileId, job.Status, job.CreatedAtUtc);
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("unique") == true)
        {
            // Fallback for duplicates caught by DB constraints
            throw new ConflictException("A transcription job is already being created for this file.");
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    // Helpers

    private async Task<Guid> ResolveAndValidateMediaFileAsync(string userId, CreateTranscriptionJobRequest request,
        CancellationToken ct)
    {
        Guid mediaFileId;
        if (request.UploadSessionId.HasValue)
        {
            mediaFileId = await PromoteSessionToMediaFileAsync(request.UploadSessionId.Value, userId, ct);
        }
        else if (request.MediaFileId.HasValue)
        {
            mediaFileId = request.MediaFileId.Value;
        }
        else
        {
            throw new ValidationException("Either MediaFileId or UploadSessionId must be provided.");
        }

        await ValidateMediaFileAccessAsync(mediaFileId, userId, ct);
        return mediaFileId;
    }

    private async Task<Guid> PromoteSessionToMediaFileAsync(Guid sessionId, string userId, CancellationToken ct)
    {
        var session =
            await _context.UploadSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);
        if (session == null) throw new NotFoundException($"Upload session {sessionId} not found.");

        // Idempotency: return existing if already promoted
        if (session.MediaFileId.HasValue &&
            await _context.MediaFiles.AnyAsync(m => m.Id == session.MediaFileId.Value, ct))
        {
            return session.MediaFileId.Value;
        }

        if (session.Status != UploadSessionStatus.Ready)
            throw new ValidationException($"Upload session is not ready for transcription. Current status: {session.Status}");

        var mediaFile = new MediaFile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OriginalFileName = session.FileName,
            ContentType = session.DeclaredContentType,
            StorageObjectKey = session.StorageKey,
            ETag = session.ETag ?? string.Empty,
            BucketName = session.BucketName,
            StorageProvider = session.StorageProvider,
            CreatedFromUploadSessionId = session.Id,
            NormalizedAudioObjectKey = null,
            SizeBytes = session.SizeBytes,
            FileType = session.DetectedMediaType == MediaFileType.Video ? MediaFileType.Video : MediaFileType.Audio,
            DurationSeconds = session.DurationSeconds,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.MediaFiles.Add(mediaFile);
        session.MediaFileId = mediaFile.Id;

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Promoted session {SessionId} to media file {MediaFileId}", sessionId, mediaFile.Id);

        return mediaFile.Id;
    }

    private async Task ValidateMediaFileAccessAsync(Guid mediaFileId, string userId, CancellationToken ct)
    {
        var exists = await _queries.GetMediaFileByIdAsync(mediaFileId, userId, ct) != null;
        if (!exists) throw new NotFoundException($"MediaFile {mediaFileId} not found.");
    }

    private async Task EnsureNoPendingJobsAsync(Guid mediaFileId, string userId, CancellationToken ct)
    {
        if (await _queries.HasPendingJobForMediaAsync(mediaFileId, userId, ct))
            throw new ConflictException("A transcription job is already in progress for this media file.");
    }

    private async Task EnsurePlanLimitsAsync(string userId, CancellationToken ct)
    {
        var plan = await GetUserPlanAsync(userId, ct);

        var dailyCount = await _queries.CountDailyJobsAsync(userId, DateTime.UtcNow, ct);
        _planGuard.EnsureDailyTranscriptionLimit(plan, dailyCount);

        var activeCount = await _queries.CountActiveJobsAsync(userId, ct);
        _planGuard.EnsureConcurrentJobs(plan, activeCount);
    }

    private async Task<PlanDefinition> GetUserPlanAsync(string userId, CancellationToken ct)
    {
        var user = await _queries.GetUserByIdAsync(userId, ct);
        if (user == null) throw new NotFoundException($"User {userId} not found.");
        return _planResolver.GetPlanDefinition(user.Plan);
    }

    private async Task<TranscriptionJob> CreateAndPersistJobAsync(string userId, Guid mediaFileId,
        CreateTranscriptionJobRequest request, CancellationToken ct)
    {
        var job = new TranscriptionJob
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            User = null!,
            MediaFileId = mediaFileId,
            MediaFile = null!,
            Status = TranscriptionJobStatus.Pending,
            Quality = request.Quality,
            LanguageCode = request.LanguageCode,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.TranscriptionJobs.Add(job);
        await _context.SaveChangesAsync(ct); // Part of transaction
        return job;
    }

    public async Task CancelJobAsync(Guid jobId, string userId, CancellationToken ct)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            var job = await _context.TranscriptionJobs
                .Include(j => j.MediaFile)
                .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId, ct);

            if (job == null) throw new NotFoundException($"Transcription job {jobId} not found.");

            // RACE CHECK: If Runner completed it, we must NOT cancel and must NOT charge (Runner already did)
            if (job.Status == TranscriptionJobStatus.Completed)
            {
                _logger.LogInformation("Job {JobId} is already Completed. Aborting cancellation.", jobId);
                return;
            }

            if (job.Status is TranscriptionJobStatus.Failed or TranscriptionJobStatus.Cancelled)
            {
                return;
            }

            // Charge for work done if we are cancelling mid-processing
            if (job.MediaFile.DurationSeconds.HasValue)
            {
                var usageMinutes = job.MediaFile.DurationSeconds.Value / 60.0;
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"UPDATE \"AspNetUsers\" SET \"UsedMinutesThisMonth\" = \"UsedMinutesThisMonth\" + {usageMinutes} WHERE \"Id\" = {userId}",
                    ct);
                _logger.LogInformation("Charged user {UserId} {Minutes:F2} min for cancelled job {JobId}", userId,
                    usageMinutes, jobId);
            }

            job.Status = TranscriptionJobStatus.Cancelled;
            job.CompletedAtUtc = DateTime.UtcNow;

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            
            // Trigger webhook
            await _webhookService.EnqueueAsync(userId, WebhookEvents.JobCancelled, new
            {
                jobId = job.Id,
                mediaFileId = job.MediaFileId,
                status = "Cancelled"
            }, ct);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    private void EnqueueBackgroundJob(Guid jobId, PlanDefinition plan)
    {
        var queue = _planResolver.GetQueueName(plan);
        _backgroundJobClient.Create<TranscriptionJobRunner>(
            runner => runner.RunAsync(jobId, CancellationToken.None),
            new EnqueuedState(queue));
        _logger.LogDebug("Enqueued job {JobId} to queue '{Queue}'", jobId, queue);
    }
}