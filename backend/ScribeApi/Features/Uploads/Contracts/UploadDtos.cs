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
    string? UploadUrl,
    string? UploadId,
    string Key,
    long InitialChunkSize,
    DateTime ExpiresAtUtc,
    string CorrelationId
);

public record CompleteUploadRequest(
    List<PartDto>? Parts = null
);

// Azure uses Block IDs derived from part numbers, not ETags
public record PartDto(int PartNumber);

public record UploadSessionStatusResponse(
    Guid Id,
    string Status,
    string? ErrorMessage,
    DateTime CreatedAtUtc,
    DateTime? UploadedAtUtc,
    DateTime? ValidatedAtUtc
);
