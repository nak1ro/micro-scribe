using Microsoft.AspNetCore.Http;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads;

public record InitUploadRequest(
    string FileName,
    string ContentType,
    long TotalSizeBytes
);

public record UploadSessionDto(
    Guid Id,
    string StorageKeyPrefix,
    UploadSessionStatus Status,
    DateTime ExpiresAtUtc
);

public record FinalizeUploadRequest(
    Guid SessionId, 
    IFormFile File 
);
