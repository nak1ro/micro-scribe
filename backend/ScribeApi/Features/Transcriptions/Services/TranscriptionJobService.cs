using Hangfire;
using Hangfire.States;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ScribeApi.Core.Domain.Plans;
using ScribeApi.Core.Exceptions;
using ScribeApi.Features.Transcriptions.Contracts;
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
    private readonly ILogger<TranscriptionJobService> _logger;

    public TranscriptionJobService(
        AppDbContext context,
        ITranscriptionJobQueries queries,
        IPlanResolver planResolver,
        IPlanGuard planGuard,
        IBackgroundJobClient backgroundJobClient,
        ILogger<TranscriptionJobService> logger)
    {
        _context = context;
        _queries = queries;
        _planResolver = planResolver;
        _planGuard = planGuard;
        _backgroundJobClient = backgroundJobClient;
        _logger = logger;
    }

    public async Task<TranscriptionJobResponse> StartJobAsync(
        string userId,
        CreateTranscriptionJobRequest request,
        CancellationToken ct)
    {
        Guid finalMediaFileId;

        // 1. Resolve MediaFileId (Direct vs Promotion)
        if (request.UploadSessionId.HasValue)
        {
            finalMediaFileId = await PromoteSessionToAssetAsync(request.UploadSessionId.Value, userId, ct);
        }
        else if (request.MediaFileId.HasValue)
        {
            finalMediaFileId = request.MediaFileId.Value;
        }
        else
        {
            throw new ArgumentException("Either MediaFileId or UploadSessionId must be provided.");
        }

        // 2. Validate MediaFile existence & ownership
        await ValidateMediaFileAsync(finalMediaFileId, userId, ct);

        // 3. Check for duplicate pending jobs
        if (await _queries.HasPendingJobForMediaAsync(finalMediaFileId, userId, ct))
        {
            throw new InvalidOperationException($"A transcription job for MediaFile {finalMediaFileId} is already pending or processing.");
        }
        
        var user = await _queries.GetUserByIdAsync(userId, ct);
        if (user == null)
        {
            throw new NotFoundException($"User {userId} not found.");
        }

        var plan = _planResolver.GetPlanDefinition(user.Plan);
        
        // 4. Validate Limits
        var dailyCount = await _queries.CountDailyJobsAsync(userId, DateTime.UtcNow, ct);
        _planGuard.EnsureDailyTranscriptionLimit(plan, dailyCount);

        var activeJobsCount = await _queries.CountActiveJobsAsync(userId, ct);
        _planGuard.EnsureConcurrentJobs(plan, activeJobsCount);

        // 5. Create Job
        var job = await CreateAndPersistJobAsync(userId, finalMediaFileId, request, ct);

        // 6. Enqueue
        EnqueueBackgroundJob(job.Id, plan);

        _logger.LogInformation(
            "Transcription job {JobId} created for MediaFile {MediaFileId} (Source Session: {SessionId})",
            job.Id, finalMediaFileId, request.UploadSessionId);

        return new TranscriptionJobResponse(
            job.Id,
            job.MediaFileId,
            job.Status,
            job.CreatedAtUtc);
    }

    private async Task<Guid> PromoteSessionToAssetAsync(Guid sessionId, string userId, CancellationToken ct)
    {
        // Fetch session with tracking to update
        var session = await _context.UploadSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);

        if (session == null)
            throw new NotFoundException($"Upload session {sessionId} not found.");

        if (session.Status != UploadSessionStatus.Ready)
            throw new InvalidOperationException($"Upload session {sessionId} is not in Ready state (Status: {session.Status}).");

        // Idempotency: Check if already promoted
        if (session.MediaFileId.HasValue)
        {
             // Verify it actually exists
             var exists = await _context.MediaFiles.AnyAsync(m => m.Id == session.MediaFileId.Value, ct);
             if (exists) return session.MediaFileId.Value;
             // Else fall through to recreate (data inconsistency, strictness?)
             // strictness: we have StorageKey. We can recreate.
        }

        // Check if created but linkage missing (improbable if transaction successful, but possible manually?)
        // Enforce invariants: "Replacing a file must create a new MediaFile."
        // So we create a NEW MediaFile.
        
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
            
            // NormalizedAudioObjectKey replaces AudioPath
            // We initialize it as null or if we detected audio, maybe same as storage key?
            // If it's audio, NormalizedAudio is initially null until processed? Or if uploaded as mp3?
            // "Normalized" implies post-processing.
            NormalizedAudioObjectKey = null, 
            
            SizeBytes = session.SizeBytes,
            FileType = session.DetectedMediaType.HasValue && session.DetectedMediaType == MediaFileType.Video 
                ? MediaFileType.Video 
                : MediaFileType.Audio, // Default or map directly if session uses MediaFileType
            DurationSeconds = session.DurationSeconds,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.MediaFiles.Add(mediaFile);
        
        // Link session
        session.MediaFileId = mediaFile.Id;
        
        await _context.SaveChangesAsync(ct);
        
        _logger.LogInformation("Promoted UploadSession {SessionId} to MediaFile {MediaFileId}", sessionId, mediaFile.Id);
        
        return mediaFile.Id;
    }

    private async Task ValidateMediaFileAsync(
        Guid mediaFileId,
        string userId,
        CancellationToken ct)
    {
        var mediaFile = await _queries.GetMediaFileByIdAsync(mediaFileId, userId, ct);

        if (mediaFile == null)
        {
            throw new NotFoundException(
                $"MediaFile {mediaFileId} not found or does not belong to user.");
        }
    }

    private async Task<TranscriptionJob> CreateAndPersistJobAsync(
        string userId,
        Guid mediaFileId,
        CreateTranscriptionJobRequest request,
        CancellationToken ct)
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
        await _context.SaveChangesAsync(ct);

        return job;
    }

    private void EnqueueBackgroundJob(Guid jobId, PlanDefinition plan)
    {
        var queue = _planResolver.GetQueueName(plan);

        _backgroundJobClient.Create<TranscriptionJobRunner>(
            runner => runner.RunAsync(jobId, CancellationToken.None),
            new EnqueuedState(queue));

        _logger.LogDebug(
            "Enqueued job {JobId} to queue '{Queue}'",
            jobId, queue);
    }
}