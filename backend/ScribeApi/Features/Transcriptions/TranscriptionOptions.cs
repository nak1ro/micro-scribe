using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions;

// for later implementation
public class TranscriptionOptions
{
    public TranscriptionQuality Quality { get; init; } = TranscriptionQuality.Balanced;

    // Explicit language code; if null, provider may auto-detect.
    public string? LanguageCode { get; init; }

    // Reserved for future: diarization, profanity filter, etc.
    public bool EnableDiarization { get; init; }
}