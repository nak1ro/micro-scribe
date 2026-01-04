namespace ScribeApi.Infrastructure.Persistence.Entities;

public enum MediaFileType
{
    Audio = 0,
    Video = 1
}

public class MediaFile
{
    public Guid Id { get; set; }

    public required string UserId { get; set; }

    public required string OriginalFileName { get; set; }

    public required string ContentType { get; set; }

    public required string StorageObjectKey { get; set; }

    public required string BucketName { get; set; }
    
    public required string StorageProvider { get; set; }

    public const string StorageProviderS3 = "S3";
    public const string StorageProviderYouTube = "YouTube";

    // ETag from storage (optional - Azure provides this after blob is committed)
    public string? ETag { get; set; }

    public Guid? CreatedFromUploadSessionId { get; set; }

    public string? NormalizedAudioObjectKey { get; set; }

    public long SizeBytes { get; set; }

    public MediaFileType FileType { get; set; }

    public double? DurationSeconds { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation
    public ApplicationUser User { get; set; } = null!;
    public ICollection<TranscriptionJob> TranscriptionJobs { get; set; } = new List<TranscriptionJob>();
}