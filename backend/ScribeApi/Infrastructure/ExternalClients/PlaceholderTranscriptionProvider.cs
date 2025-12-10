using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.ExternalClients;

public class PlaceholderTranscriptionProvider : ITranscriptionProvider
{
    public Task<TranscriptionResult> TranscribeAsync(
        Stream audioStream, 
        TranscriptionQuality quality,
        string? languageHint,
        CancellationToken ct)
    {
        // Placeholder: return dummy data for testing the pipeline
        var result = new TranscriptionResult(
            FullTranscript: "[Placeholder transcript - integrate real provider]",
            DetectedLanguage: languageHint ?? "en",
            Segments: new List<TranscriptSegmentData>
            {
                new("Placeholder segment", 0, 5)
            }
        );
        
        return Task.FromResult(result);
    }
}
