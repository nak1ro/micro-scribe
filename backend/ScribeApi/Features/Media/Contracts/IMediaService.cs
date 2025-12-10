using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Media.Contracts;

public interface IMediaService
{
    Task<MediaFileDto> GetMediaFileAsync(Guid id, string userId, CancellationToken ct = default);
    
    Task<PagedResponse<MediaFileDto>> ListMediaFilesAsync(string userId, int page, int pageSize, CancellationToken ct = default);
    
    // Deletes entity AND files
    Task DeleteMediaFileAsync(Guid id, string userId, CancellationToken ct = default);

    // Deletes ONLY files (used by background jobs)
    Task DeleteMediaFilesAsync(MediaFile mediaFile, CancellationToken ct = default);
}
