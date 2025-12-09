using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads;

public interface IUploadService
{
    Task<UploadSession> CreateSessionAsync(string userId, InitUploadRequest request, CancellationToken ct);
    Task<MediaFile?> UploadChunkAsync(Guid sessionId, int chunkIndex, Stream chunkStream, string userId, CancellationToken ct);
}
