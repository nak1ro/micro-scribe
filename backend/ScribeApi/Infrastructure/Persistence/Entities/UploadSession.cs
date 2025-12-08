namespace ScribeApi.Infrastructure.Persistence.Entities;

public enum UploadSessionStatus
{
    Active = 0,
    Completed = 1,
    Expired = 2,
    Cancelled = 3
}

public class UploadSession
{
    public Guid Id { get; set; }


    public required string UserId { get; set; }
    public required ApplicationUser User { get; set; }

    // Original file name as provided by the client.
    public required string OriginalFileName { get; set; }

    // Reported total size of the file in bytes (optional but useful for validation).
    public long? TotalSizeBytes { get; set; }

    // MIME type sent by the client (e.g. "video/mp4", "audio/mpeg").
    public string? ContentType { get; set; }

    // Total number of chunks expected for this upload.
    public int TotalChunks { get; set; }

    // How many chunks have been successfully received so far.
    public int ReceivedChunksCount { get; set; }

    // A prefix/folder/key under which chunks are stored in your storage backend.
    // For example: "uploads/sessions/{Id}/".
    public required string StorageKeyPrefix { get; set; }

    // Current status of the upload session.
    public UploadSessionStatus Status { get; set; } = UploadSessionStatus.Active;

    // When the session was created.
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // When the session should be considered expired and eligible for cleanup.
    public DateTime ExpiresAtUtc { get; set; }

    // When the upload was fully completed and merged (if it was).
    public DateTime? CompletedAtUtc { get; set; }

    // Link to the resulting MediaFile once chunks are merged and stored.
    public Guid? MediaFileId { get; set; }

    public MediaFile? MediaFile { get; set; }
}