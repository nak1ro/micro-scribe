namespace ScribeApi.Infrastructure.Persistence.Entities;

public class TranscriptChapter
{
    // Unique identifier
    public Guid Id { get; set; }

    // FK to parent transcription job
    public Guid TranscriptionJobId { get; set; }

    // Display title of the chapter
    public required string Title { get; set; }

    // Start time in seconds
    public double StartSeconds { get; set; }

    // Optional end time in seconds
    public double? EndSeconds { get; set; }

    // Order of chapter in transcript
    public int Order { get; set; }

    // Nav
    public required TranscriptionJob TranscriptionJob { get; set; }
}