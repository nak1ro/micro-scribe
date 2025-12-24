namespace ScribeApi.Core.Interfaces;

// Provider-agnostic translation interface for easy switching between services
public interface ITranslationService
{
    // Translate multiple texts in batch (more efficient than one-by-one)
    Task<List<string>> TranslateAsync(
        List<string> texts,
        string sourceLanguage,
        string targetLanguage,
        CancellationToken ct);
    
    // Check if language pair is supported
    Task<bool> IsLanguageSupportedAsync(string languageCode, CancellationToken ct);
}
