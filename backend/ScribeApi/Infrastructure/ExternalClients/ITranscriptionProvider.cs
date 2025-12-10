using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.ExternalClients;

public record TranscriptionResult(
    string FullTranscript,
    string? DetectedLanguage,
    List<TranscriptSegmentData> Segments
);

public record TranscriptSegmentData(
    string Text,
    double StartSeconds,
    double EndSeconds,
    string? Speaker = null
);

public interface ITranscriptionProvider
{
    Task<TranscriptionResult> TranscribeAsync(
        Stream audioStream, 
        TranscriptionQuality quality,
        string? languageHint,
        CancellationToken ct);
}