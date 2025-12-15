namespace ScribeApi.Infrastructure.Persistence.Entities;

public class TranscriptSegment
{
    // Unique identifier (useful for UI/Editing)
    public Guid Id { get; set; } = Guid.NewGuid();

    // Segment text content
    public required string Text { get; set; }

    // Start time in seconds from audio beginning
    public double StartSeconds { get; set; }

    // End time in seconds from audio beginning
    public double EndSeconds { get; set; }

    // Speaker label for diarization support
    public string? Speaker { get; set; }

    // Original text before any edits
    public string? OriginalText { get; set; }

    // Whether segment text has been edited
    public bool IsEdited { get; set; }

    // Timestamp of last edit
    public DateTime? LastEditedAtUtc { get; set; }
}