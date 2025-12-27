namespace ScribeApi.Features.Translation.Contracts;

// Interface for job-level translation operations
public interface IJobTranslationService
{
    Task EnqueueTranslationAsync(Guid jobId, string userId, string targetLanguage, CancellationToken ct);
}
