using Hangfire;
using Hangfire.States;
using Microsoft.Extensions.Logging;
using ScribeApi.Common.Configuration.Plans;
using ScribeApi.Common.Exceptions;
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
        await ValidateMediaFileAsync(request.MediaFileId, userId, ct);
        var plan = await ValidatePlanLimitsAsync(userId, ct);
        var job = await CreateAndPersistJobAsync(userId, request, ct);

        EnqueueBackgroundJob(job.Id, plan.PlanType);

        _logger.LogInformation(
            "Transcription job {JobId} created for MediaFile {MediaFileId}",
            job.Id, request.MediaFileId);

        return new TranscriptionJobResponse(
            job.Id,
            job.MediaFileId,
            job.Status,
            job.CreatedAtUtc);
    }

    private async Task<MediaFile> ValidateMediaFileAsync(
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

        return mediaFile;
    }

    private async Task<PlanDefinition> ValidatePlanLimitsAsync(
        string userId,
        CancellationToken ct)
    {
        var user = await _queries.GetUserByIdAsync(userId, ct);
        if (user == null)
        {
            throw new NotFoundException($"User {userId} not found.");
        }

        var plan = _planResolver.GetPlanDefinition(user.Plan);
        var activeJobsCount = await _queries.CountActiveJobsAsync(userId, ct);

        _planGuard.EnsureConcurrentJobs(plan, activeJobsCount);

        return plan;
    }

    private async Task<TranscriptionJob> CreateAndPersistJobAsync(
        string userId,
        CreateTranscriptionJobRequest request,
        CancellationToken ct)
    {
        var job = new TranscriptionJob
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            User = null!,
            MediaFileId = request.MediaFileId,
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

    private void EnqueueBackgroundJob(Guid jobId, PlanType planType)
    {
        var queue = DetermineQueueName(planType);

        _backgroundJobClient.Create<TranscriptionJobRunner>(
            runner => runner.RunAsync(jobId, CancellationToken.None),
            new EnqueuedState(queue));

        _logger.LogDebug(
            "Enqueued job {JobId} to queue '{Queue}'",
            jobId, queue);
    }

    private static string DetermineQueueName(PlanType planType)
    {
        return planType switch
        {
            PlanType.Pro => "priority",
            _ => "default"
        };
    }
}