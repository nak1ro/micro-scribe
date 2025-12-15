using ScribeApi.Core.Interfaces;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Transcription;

// Orchestrates multi-chunk transcription and merges results
public class ChunkedTranscriptionService
{
    private readonly ITranscriptionProvider _transcriptionProvider;
    private readonly IFileStorageService _storageService;
    private readonly ILogger<ChunkedTranscriptionService> _logger;

    public ChunkedTranscriptionService(
        ITranscriptionProvider transcriptionProvider,
        IFileStorageService storageService,
        ILogger<ChunkedTranscriptionService> logger)
    {
        _transcriptionProvider = transcriptionProvider;
        _storageService = storageService;
        _logger = logger;
    }

    public async Task<TranscriptionResult> TranscribeChunkedAsync(
        List<AudioChunk> chunks,
        TranscriptionQuality quality,
        string? languageHint,
        CancellationToken ct)
    {
        if (chunks.Count == 0)
            throw new ArgumentException("No chunks provided for transcription");

        // Single chunk - just transcribe directly
        if (chunks.Count == 1)
        {
            return await TranscribeSingleChunkAsync(chunks[0], quality, languageHint, ct);
        }

        _logger.LogInformation("Starting chunked transcription of {Count} chunks", chunks.Count);

        var allSegments = new List<TranscriptSegmentData>();
        var fullTranscriptParts = new List<string>();
        string? detectedLanguage = null;

        // Transcribe chunks sequentially to avoid rate limits
        for (var i = 0; i < chunks.Count; i++)
        {
            var chunk = chunks[i];
            _logger.LogInformation("Transcribing chunk {Index}/{Total}, Offset: {Offset}s", 
                i + 1, chunks.Count, chunk.StartOffset.TotalSeconds);

            var result = await TranscribeSingleChunkAsync(
                chunk, 
                quality, 
                languageHint ?? detectedLanguage, // Use detected language from first chunk
                ct);

            // Use language from first chunk if not specified
            detectedLanguage ??= result.DetectedLanguage;

            // Add transcript text
            if (!string.IsNullOrWhiteSpace(result.FullTranscript))
            {
                fullTranscriptParts.Add(result.FullTranscript.Trim());
            }

            // Offset segment timestamps
            var offsetSegments = result.Segments.Select(s => new TranscriptSegmentData(
                Text: s.Text,
                StartSeconds: s.StartSeconds + chunk.StartOffset.TotalSeconds,
                EndSeconds: s.EndSeconds + chunk.StartOffset.TotalSeconds,
                Speaker: s.Speaker
            ));

            allSegments.AddRange(offsetSegments);
        }

        // Merge full transcript with proper spacing
        var mergedTranscript = string.Join(" ", fullTranscriptParts);

        _logger.LogInformation("Chunked transcription complete. Total segments: {Count}", allSegments.Count);

        return new TranscriptionResult(
            FullTranscript: mergedTranscript,
            DetectedLanguage: detectedLanguage,
            Segments: allSegments,
            Chapters: new List<TranscriptChapterData>()
        );
    }

    private async Task<TranscriptionResult> TranscribeSingleChunkAsync(
        AudioChunk chunk,
        TranscriptionQuality quality,
        string? languageHint,
        CancellationToken ct)
    {
        await using var audioStream = await _storageService.OpenReadAsync(chunk.StoragePath, ct);
        var fileName = Path.GetFileName(chunk.StoragePath);

        return await _transcriptionProvider.TranscribeAsync(
            audioStream,
            fileName,
            quality,
            languageHint,
            ct);
    }
}
