namespace ScribeApi.Features.Media.Contracts;

public interface IMediaService
{
    Task<MediaFileDto> GetMediaFileAsync(Guid id, string userId, CancellationToken ct = default);
    
    Task<PagedResponse<MediaFileDto>> ListMediaFilesAsync(string userId, int page, int pageSize, CancellationToken ct = default);
    
    Task DeleteMediaFileAsync(Guid id, string userId, CancellationToken ct = default);
}
