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
    Fast = 0,
    Balanced = 1,
    Accurate = 2
}

public class TranscriptionJob
{
    // Unique identifier
    public Guid Id { get; set; }

    // FK to owning user
    public required string UserId { get; set; }

    // FK to source media file
    public Guid MediaFileId { get; set; }

    // Current status in processing pipeline
    public TranscriptionJobStatus Status { get; set; } = TranscriptionJobStatus.Pending;

    // Transcription quality setting
    public TranscriptionQuality Quality { get; set; } = TranscriptionQuality.Balanced;

    // Full transcript text after processing
    public string? Transcript { get; set; }

    // Summary of transcript content
    public string? Summary { get; set; }

    // Error message if job failed
    public string? ErrorMessage { get; set; }

    // Detected or requested language code (source language)
    public string? SourceLanguage { get; set; }

    // Duration of processed audio in seconds
    public double? DurationSeconds { get; set; }

    // When the job was created
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // When processing started
    public DateTime? StartedAtUtc { get; set; }

    // When processing completed
    public DateTime? CompletedAtUtc { get; set; }

    // Soft delete flag
    public bool IsDeleted { get; set; }

    // Current processing step (Normalizing, Transcribing, Diarizing, Translating)
    public string? ProcessingStep { get; set; }

    // Translation status (null, "Pending", "Translating", "Completed", "Failed")
    public string? TranslationStatus { get; set; }

    // Language currently being translated (e.g., "ru")
    public string? TranslatingToLanguage { get; set; }

    // Whether speaker diarization is enabled for this job
    public bool EnableSpeakerDiarization { get; set; }

    // Speaker metadata (stored as JSONB)
    public List<TranscriptionSpeaker> Speakers { get; set; } = new();

    // Nav
    public required ApplicationUser User { get; set; }
    public required MediaFile MediaFile { get; set; }
    public List<TranscriptSegment> Segments { get; set; } = new();
    public ICollection<TranscriptChapter> Chapters { get; set; } = new List<TranscriptChapter>();
    public ICollection<TranscriptionAnalysis> Analyses { get; set; } = new List<TranscriptionAnalysis>();
}