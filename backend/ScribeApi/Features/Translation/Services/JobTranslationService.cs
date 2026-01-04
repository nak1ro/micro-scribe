using Hangfire;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Domain.Plans;
using ScribeApi.Core.Exceptions;
using ScribeApi.Features.Translation.Contracts;
using ScribeApi.Infrastructure.BackgroundJobs;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Translation.Services;

// Service layer between controller and background job - validates and enqueues
public class JobTranslationService : IJobTranslationService
{
    private readonly AppDbContext _context;
    private readonly IBackgroundJobClient _backgroundJobs;
    private readonly IPlanResolver _planResolver;
    private readonly IPlanGuard _planGuard;
    private readonly ILogger<JobTranslationService> _logger;

    public JobTranslationService(
        AppDbContext context,
        IBackgroundJobClient backgroundJobs,
        IPlanResolver planResolver,
        IPlanGuard planGuard,
        ILogger<JobTranslationService> logger)
    {
        _context = context;
        _backgroundJobs = backgroundJobs;
        _planResolver = planResolver;
        _planGuard = planGuard;
        _logger = logger;
    }

    public async Task EnqueueTranslationAsync(Guid jobId, string userId, string targetLanguage, CancellationToken ct)
    {
        // Check plan allows translation
        var user = await _context.Users.OfType<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) throw new NotFoundException("User not found.");
        
        var plan = _planResolver.GetPlanDefinition(user.Plan);
        _planGuard.EnsureTranslationAllowed(plan);

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

