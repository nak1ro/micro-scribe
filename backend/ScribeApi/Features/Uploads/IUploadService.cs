using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads;

public interface IUploadService
{
    Task<UploadSession> CreateSessionAsync(string userId, InitUploadRequest request, CancellationToken ct);
    Task<MediaFile> UploadFileAsync(Guid sessionId, Stream fileStream, string userId, CancellationToken ct);
}
