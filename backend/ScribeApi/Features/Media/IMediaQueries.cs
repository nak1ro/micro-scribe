using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Media;

public interface IMediaQueries
{
    Task<MediaFile?> GetByIdAsync(Guid id, string userId, CancellationToken ct = default);
    
    Task<PagedResponse<MediaFile>> ListAsync(string userId, int page, int pageSize, CancellationToken ct = default);
}
