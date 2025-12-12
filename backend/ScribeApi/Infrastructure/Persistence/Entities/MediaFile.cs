namespace ScribeApi.Infrastructure.Persistence.Entities;

public enum MediaFileType
{
    Audio = 0,
    Video = 1
}

public class MediaFile
{
    // Unique identifier
    public Guid Id { get; set; }

    // FK to owning user
    public required string UserId { get; set; }

    // Original file name from upload
    public required string OriginalFileName { get; set; }

    // MIME content type
    public required string ContentType { get; set; }

    // Object key in storage bucket
    public required string StorageObjectKey { get; set; }

    // Storage bucket name
    public required string BucketName { get; set; }

    // Storage provider identifier (e.g. "S3")
    public required string StorageProvider { get; set; }

    // ETag from storage for integrity verification
    public required string ETag { get; set; }

    // Upload session that created this file
    public required Guid CreatedFromUploadSessionId { get; set; }

    // Object key for normalized audio (wav, mp3, ogg)
    public string? NormalizedAudioObjectKey { get; set; }

    // File size in bytes
    public long SizeBytes { get; set; }

    // Type of media (Audio or Video)
    public MediaFileType FileType { get; set; }

    // Duration in seconds
    public double? DurationSeconds { get; set; }

    // When the file was created
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Nav
    public ApplicationUser User { get; set; } = null!;
    public ICollection<TranscriptionJob> TranscriptionJobs { get; set; } = new List<TranscriptionJob>();
}