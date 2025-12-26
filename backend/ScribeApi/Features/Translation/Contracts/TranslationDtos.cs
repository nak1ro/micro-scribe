namespace ScribeApi.Features.Translation.Contracts;

// Request to translate an existing transcription job
public record TranslateJobRequest(string TargetLanguage);
