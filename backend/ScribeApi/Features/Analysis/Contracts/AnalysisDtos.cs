namespace ScribeApi.Features.Analysis.Contracts;

// Request to generate AI analysis on transcription
public record GenerateAnalysisRequest(List<string> Types);

// Request to translate analysis content
public record TranslateAnalysisRequest(string TargetLanguage);

// DTO for transcription analysis result
public class TranscriptionAnalysisDto
{
    public Guid Id { get; init; }
    public string AnalysisType { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public Dictionary<string, string> Translations { get; init; } = new();
    public DateTime CreatedAtUtc { get; init; }
}
