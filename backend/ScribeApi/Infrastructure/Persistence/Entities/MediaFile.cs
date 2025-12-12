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
    public ApplicationUser User { get; set; } = null!;

    public required string OriginalFileName { get; set; }

    public required string ContentType { get; set; }

    // Immutable Storage Reference
    public required string StorageObjectKey { get; set; }
    public required string BucketName { get; set; }
    public required string StorageProvider { get; set; }
    public required string ETag { get; set; }

    // Linkage to Source
    public required Guid CreatedFromUploadSessionId { get; set; }

    // Normalized audio object key (ie wav, mp3 or ogg) in same bucket/provider
    public string? NormalizedAudioObjectKey { get; set; }

    public long SizeBytes { get; set; }

    public MediaFileType FileType { get; set; }

    public double? DurationSeconds { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<TranscriptionJob> TranscriptionJobs { get; set; } = new List<TranscriptionJob>();
}