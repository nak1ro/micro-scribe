namespace ScribeApi.Infrastructure.Persistence.Entities;

public class TranscriptSegment
{
    // Unique identifier
    public Guid Id { get; set; }

    // FK to parent transcription job
    public Guid TranscriptionJobId { get; set; }

    // Segment text content
    public required string Text { get; set; }

    // Start time in seconds from audio beginning
    public double StartSeconds { get; set; }

    // End time in seconds from audio beginning
    public double EndSeconds { get; set; }

    // Order of segment in transcript
    public int Order { get; set; }

    // Speaker label for diarization support
    public string? Speaker { get; set; }

    // Original text before any edits
    public string? OriginalText { get; set; }

    // Whether segment text has been edited
    public bool IsEdited { get; set; }

    // Timestamp of last edit
    public DateTime? LastEditedAtUtc { get; set; }

    // Nav
    public required TranscriptionJob TranscriptionJob { get; set; }
}