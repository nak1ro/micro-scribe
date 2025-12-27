namespace ScribeApi.Infrastructure.Persistence.Entities;

// Speaker metadata for diarization support, stored as JSONB in TranscriptionJob
public class TranscriptionSpeaker
{
    // Speaker ID from WhisperX (e.g., "SPEAKER_00")
    public required string Id { get; set; }

    // User-editable display name
    public string? DisplayName { get; set; }

    // UI color assignment for speaker
    public string? Color { get; set; }
}
