using Hangfire;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Exceptions;
using ScribeApi.Infrastructure.BackgroundJobs;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Services;

// Interface for job-level translation operations
public interface IJobTranslationService
{
    Task EnqueueTranslationAsync(Guid jobId, string userId, string targetLanguage, CancellationToken ct);
}

// Service layer between controller and background job - validates and enqueues
public class JobTranslationService : IJobTranslationService
{
    private readonly AppDbContext _context;
    private readonly IBackgroundJobClient _backgroundJobs;
    private readonly ILogger<JobTranslationService> _logger;

    public JobTranslationService(
        AppDbContext context,
        IBackgroundJobClient backgroundJobs,
        ILogger<JobTranslationService> logger)
    {
        _context = context;
        _backgroundJobs = backgroundJobs;
        _logger = logger;
    }

    public async Task EnqueueTranslationAsync(Guid jobId, string userId, string targetLanguage, CancellationToken ct)
    {
        var job = await _context.TranscriptionJobs
            .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId, ct);

        if (job == null)
            throw new NotFoundException("Transcription job not found.");

        if (job.Status != TranscriptionJobStatus.Completed)
            throw new ValidationException("Cannot translate: job is not completed.");

        if (string.IsNullOrWhiteSpace(job.SourceLanguage))
            throw new ValidationException("Cannot translate: source language is unknown.");

        if (job.SourceLanguage.Equals(targetLanguage, StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("Source and target languages are the same.");

        if (job.TranslationStatus == "Translating")
            throw new ValidationException("A translation is already in progress.");

        // Mark as pending
        job.TranslationStatus = "Pending";
        job.TranslatingToLanguage = targetLanguage;
        await _context.SaveChangesAsync(ct);

        // Enqueue background job
        _backgroundJobs.Enqueue<TranslationJobRunner>(
            x => x.RunAsync(jobId, userId, targetLanguage, CancellationToken.None));

        _logger.LogInformation("Enqueued translation job {JobId} to {Language}", jobId, targetLanguage);
    }
}
