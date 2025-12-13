namespace ScribeApi.Infrastructure.Persistence.Entities;

public enum UploadSessionStatus
{
    Created = 0,
    Uploading = 1,
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
    // Unique identifier
    public Guid Id { get; set; }

    // FK to owning user
    public required string UserId { get; set; }

    // Client-provided request ID for idempotency
    public string? ClientRequestId { get; set; }

    // Correlation ID for distributed tracing
    public required string CorrelationId { get; set; }

    // Original file name from client
    public required string FileName { get; set; }

    // MIME type declared by client
    public required string DeclaredContentType { get; set; }

    // File size in bytes
    public long SizeBytes { get; set; }

    // Container type detected during validation
    public string? DetectedContainerType { get; set; }

    // Media type detected during validation
    public MediaFileType? DetectedMediaType { get; set; }

    // Media duration in seconds
    public double? DurationSeconds { get; set; }

    // Object key in storage bucket
    public required string StorageKey { get; set; }

    // Multipart upload ID for S3
    public string? UploadId { get; set; }

    // ETag from storage for integrity
    public string? ETag { get; set; }

    // Storage provider identifier
    public string StorageProvider { get; set; } = "S3";

    // Storage bucket name
    public required string BucketName { get; set; }

    // Current session status
    public UploadSessionStatus Status { get; set; } = UploadSessionStatus.Created;

    // Error message if failed
    public string? ErrorMessage { get; set; }

    // When session was created
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // When session expires
    public DateTime ExpiresAtUtc { get; set; }

    // When presigned URL expires
    public DateTime? UrlExpiresAtUtc { get; set; }

    // When file was uploaded
    public DateTime? UploadedAtUtc { get; set; }

    // When validation completed
    public DateTime? ValidatedAtUtc { get; set; }

    // Soft delete timestamp
    public DateTime? DeletedAtUtc { get; set; }

    // Concurrency control token (PostgreSQL xmin)
    public uint xmin { get; set; }

    // FK to created media file
    public Guid? MediaFileId { get; set; }

    // Nav
    public ApplicationUser User { get; set; } = null!;
    public MediaFile? MediaFile { get; set; }
}
