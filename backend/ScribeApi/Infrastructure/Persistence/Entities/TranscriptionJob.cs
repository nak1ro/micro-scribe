namespace ScribeApi.Infrastructure.Persistence.Entities;

public enum TranscriptionJobStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4
}

public enum TranscriptionQuality
{
    Fast = 0, // lower cost, lower accuracy
    Balanced = 1, // default
    Accurate = 2 // slower, more expensive, best quality
}

public class TranscriptionJob
{
    public Guid Id { get; set; }

    public required string UserId { get; set; }
    public required ApplicationUser User { get; set; }

    // The media file this job is based on.
    public Guid MediaFileId { get; set; }
    public required MediaFile MediaFile { get; set; }

    // Current status in the processing pipeline.
    public TranscriptionJobStatus Status { get; set; } = TranscriptionJobStatus.Pending;

    public TranscriptionQuality Quality { get; set; } = TranscriptionQuality.Balanced;

    // Full transcript text after successful processing.
    public string? Transcript { get; set; }

    // Optional summary of the transcript 
    public string? Summary { get; set; }

    // Error message if the job failed.
    public string? ErrorMessage { get; set; }

    // Detected or requested language code (e.g. "en", "pl").
    public string? LanguageCode { get; set; }

    // Duration of audio that was actually processed (in seconds).
    public double? DurationSeconds { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    
    public ICollection<TranscriptSegment> Segments { get; set; } = new List<TranscriptSegment>();
    public ICollection<TranscriptChapter> Chapters { get; set; } = new List<TranscriptChapter>();

    // Soft delete flag if you ever want to hide jobs without removing them.
    public bool IsDeleted { get; set; }
}