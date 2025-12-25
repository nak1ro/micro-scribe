using Hangfire;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Interfaces;
using ScribeApi.Infrastructure.Persistence;

namespace ScribeApi.Infrastructure.BackgroundJobs;

// Background job for translating transcription segments
public class TranslationJobRunner
{
    private readonly AppDbContext _context;
    private readonly ITranslationService _translationService;
    private readonly IJobNotificationService _notificationService;
    private readonly ILogger<TranslationJobRunner> _logger;

    public TranslationJobRunner(
        AppDbContext context,
        ITranslationService translationService,
        IJobNotificationService notificationService,
        ILogger<TranslationJobRunner> logger)
    {
        _context = context;
        _translationService = translationService;
        _notificationService = notificationService;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 2)]
    public async Task RunAsync(Guid jobId, string userId, string targetLanguage, CancellationToken ct)
    {
        _logger.LogInformation("Starting translation job {JobId} to {Language}", jobId, targetLanguage);

        // Segments is JSONB, auto-loaded with entity (no Include needed)
        var job = await _context.TranscriptionJobs
            .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId, ct);

        if (job == null)
        {
            _logger.LogWarning("Translation job {JobId} not found", jobId);
            return;
        }

        try
        {
            // Mark as translating
            job.TranslationStatus = "Translating";
            job.TranslatingToLanguage = targetLanguage;
            await _context.SaveChangesAsync(ct);
            await _notificationService.NotifyTranslationStatusAsync(jobId, userId, "Translating", targetLanguage);

            var sourceLanguage = job.SourceLanguage;
            if (string.IsNullOrWhiteSpace(sourceLanguage))
            {
                throw new InvalidOperationException("Source language is unknown.");
            }

            // Get texts to translate
            var orderedSegments = job.Segments.OrderBy(s => s.StartSeconds).ToList();
            var textsToTranslate = orderedSegments.Select(s => s.Text).ToList();

            if (textsToTranslate.Count == 0)
            {
                _logger.LogWarning("Job {JobId} has no segments to translate", jobId);
                job.TranslationStatus = null;
                job.TranslatingToLanguage = null;
                await _context.SaveChangesAsync(ct);
                return;
            }

            // Call translation service
            var translatedTexts = await _translationService.TranslateAsync(
                textsToTranslate,
                sourceLanguage,
                targetLanguage,
                ct);

            // Update segments with translated text
            for (int i = 0; i < orderedSegments.Count && i < translatedTexts.Count; i++)
            {
                orderedSegments[i].Translations[targetLanguage] = translatedTexts[i];
            }

            // Force EF Core to detect JSONB changes by reassigning the collection
            job.Segments = orderedSegments;
            _context.Entry(job).Property(j => j.Segments).IsModified = true;

            // Clear translation status
            job.TranslationStatus = null;
            job.TranslatingToLanguage = null;
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Translation completed for job {JobId} to {Language}, {Count} segments",
                jobId, targetLanguage, translatedTexts.Count);
            await _notificationService.NotifyTranslationStatusAsync(jobId, userId, null, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Translation failed for job {JobId}", jobId);
            job.TranslationStatus = "Failed";
            job.TranslatingToLanguage = null;
            await _context.SaveChangesAsync(CancellationToken.None);
            await _notificationService.NotifyTranslationStatusAsync(jobId, userId, "Failed", null);
            throw;
        }
    }
}
