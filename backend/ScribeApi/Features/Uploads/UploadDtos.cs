using Microsoft.AspNetCore.Http;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads;

public record InitUploadRequest(
    string FileName,
    string ContentType,
    long TotalSizeBytes,
    int ChunkSizeBytes  // e.g. 5 MB
);

public record UploadSessionDto(
    Guid Id,
    string StorageKeyPrefix,
    UploadSessionStatus Status,
    DateTime ExpiresAtUtc
);

public record UploadChunkRequest(
    Guid SessionId,
    int ChunkIndex,
    IFormFile Chunk
);
