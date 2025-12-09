using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads.Contracts;

public interface IUploadService
{
    Task<UploadSession> CreateSessionAsync(string userId, InitUploadRequest request, CancellationToken ct);
    Task<MediaFile?> UploadChunkAsync(Guid sessionId, int chunkIndex, Stream chunkStream, string userId, CancellationToken ct);
}
