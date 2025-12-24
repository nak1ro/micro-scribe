using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Exceptions;
using ScribeApi.Core.Interfaces;
using ScribeApi.Infrastructure.Persistence;

namespace ScribeApi.Features.Transcriptions.Services;

// Interface for job-level translation operations
public interface IJobTranslationService
{
    Task TranslateJobAsync(Guid jobId, string userId, string targetLanguage, CancellationToken ct);
}

// Service for translating transcription jobs (can be used during job or on-demand)
public class JobTranslationService : IJobTranslationService
{
    private readonly AppDbContext _context;
    private readonly ITranslationService _translationService;
    private readonly ILogger<JobTranslationService> _logger;

    public JobTranslationService(
        AppDbContext context,
        ITranslationService translationService,
        ILogger<JobTranslationService> logger)
    {
        _context = context;
        _translationService = translationService;
        _logger = logger;
    }

    public async Task TranslateJobAsync(Guid jobId, string userId, string targetLanguage, CancellationToken ct)
    {
        var job = await _context.TranscriptionJobs
            .Include(j => j.Segments)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId, ct);

        if (job == null)
            throw new NotFoundException("Transcription job not found.");

        if (job.Status != Infrastructure.Persistence.Entities.TranscriptionJobStatus.Completed)
            throw new ValidationException("Cannot translate: job is not completed.");

        var sourceLanguage = job.SourceLanguage;
        if (string.IsNullOrWhiteSpace(sourceLanguage))
            throw new ValidationException("Cannot translate: source language is unknown.");

        if (sourceLanguage.Equals(targetLanguage, StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("Source and target languages are the same.");

        _logger.LogInformation("Translating job {JobId} from {Source} to {Target}",
            jobId, sourceLanguage, targetLanguage);

        // Extract texts from segments
        var textsToTranslate = job.Segments
            .OrderBy(s => s.StartSeconds)
            .Select(s => s.Text)
            .ToList();

        if (textsToTranslate.Count == 0)
        {
            _logger.LogWarning("Job {JobId} has no segments to translate", jobId);
            return;
        }

        // Call translation service
        var translatedTexts = await _translationService.TranslateAsync(
            textsToTranslate,
            sourceLanguage,
            targetLanguage,
            ct);

        // Update segments with translated text
        var orderedSegments = job.Segments.OrderBy(s => s.StartSeconds).ToList();
        for (int i = 0; i < orderedSegments.Count && i < translatedTexts.Count; i++)
        {
            orderedSegments[i].TranslatedText = translatedTexts[i];
        }

        // Update job target language
        job.TargetLanguage = targetLanguage;

        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Successfully translated {Count} segments for job {JobId}",
            translatedTexts.Count, jobId);
    }
}
