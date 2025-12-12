using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads.Contracts;

public record InitiateUploadRequest(
    string FileName,
    string ContentType,
    long SizeBytes,
    string? ClientRequestId = null
);

public record UploadSessionResponse(
    Guid Id,
    string Status,
    string? UploadUrl, // Single file upload URL
    string? UploadId, // Multipart Upload ID (if multipart)
    string Key,       // Storage Key
    long InitialChunkSize, // Suggest chunk size or total size for client logic
    DateTime ExpiresAtUtc,
    string CorrelationId
);

public record CompleteUploadRequest(
    List<PartETagDto>? Parts = null // Null for single file, required for multipart
);

public record PartETagDto(int PartNumber, string ETag); // Maps to UploadPartInfo

public record UploadSessionStatusResponse(
    Guid Id,
    string Status,
    string? ErrorMessage,
    DateTime CreatedAtUtc,
    DateTime? UploadedAtUtc,
    DateTime? ValidatedAtUtc
);
