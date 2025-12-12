using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Entities;

public enum UploadSessionStatus
{
    Created = 0,
    Uploading = 1, // Client started upload (optional tracking)
    Uploaded = 2,
    Validating = 3,
    Ready = 4,
    Invalid = 5,
    Failed = 6,
    Aborted = 7,
    Expired = 8
}

public class UploadSession
{
    public Guid Id { get; set; }

    // Owner
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    // Identity & Safety
    public string? ClientRequestId { get; set; } // For idempotency
    public required string CorrelationId { get; set; } // For tracing

    // File Metadata
    public required string FileName { get; set; }
    public required string DeclaredContentType { get; set; } // Was ContentType
    public long SizeBytes { get; set; }
    
    // Detected during validation
    public string? DetectedContainerType { get; set; } // e.g. "mp4", "wav"
    public MediaFileType? DetectedMediaType { get; set; } // Audio/Video
    public double? DurationSeconds { get; set; }

    // Storage Metadata
    public required string StorageKey { get; set; }
    public string? UploadId { get; set; } // For multipart S3
    public string? ETag { get; set; }
    public string StorageProvider { get; set; } = "S3";
    public required string BucketName { get; set; }

    // Lifecycle
    public UploadSessionStatus Status { get; set; } = UploadSessionStatus.Created;
    public string? ErrorMessage { get; set; }
    
    // Timestamps
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? UrlExpiresAtUtc { get; set; }
    public DateTime? UploadedAtUtc { get; set; }
    public DateTime? ValidatedAtUtc { get; set; }
    public DateTime? DeletedAtUtc { get; set; } // Soft delete / Abort

    [System.ComponentModel.DataAnnotations.Timestamp]
    public byte[] RowVersion { get; set; } = null!;

    // Linkage
    public Guid? MediaFileId { get; set; }
    public MediaFile? MediaFile { get; set; }
}
