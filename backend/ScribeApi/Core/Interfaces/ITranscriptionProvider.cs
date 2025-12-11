using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Core.Interfaces;

public record TranscriptionResult(
    string FullTranscript,
    string? DetectedLanguage,
    List<TranscriptSegmentData> Segments,
    List<TranscriptChapterData> Chapters
);

public record TranscriptSegmentData(
    string Text,
    double StartSeconds,
    double EndSeconds,
    string? Speaker = null
);

public record TranscriptChapterData(
    string Title,
    double StartSeconds,
    double? EndSeconds
);

public interface ITranscriptionProvider
{
    Task<TranscriptionResult> TranscribeAsync(
        Stream audioStream, 
        string fileName,
        TranscriptionQuality quality,
        string? languageHint,
        CancellationToken ct);
}