using ScribeApi.Features.Media.Contracts;
using ScribeApi.Features.Transcriptions.Contracts;

namespace ScribeApi.Features.Folders.Contracts;

public interface IFolderService
{
    Task<List<FolderDto>> ListFoldersAsync(string userId, CancellationToken ct);
    Task<FolderDto> GetFolderAsync(Guid folderId, string userId, CancellationToken ct);
    Task<FolderDto> CreateFolderAsync(string userId, CreateFolderRequest request, CancellationToken ct);
    Task<FolderDto> UpdateFolderAsync(Guid folderId, string userId, UpdateFolderRequest request, CancellationToken ct);
    Task DeleteFolderAsync(Guid folderId, string userId, CancellationToken ct);
    Task AddItemsAsync(Guid folderId, string userId, List<Guid> jobIds, CancellationToken ct);
    Task RemoveItemsAsync(Guid folderId, string userId, List<Guid> jobIds, CancellationToken ct);
    Task<PagedResponse<TranscriptionJobListItem>> GetFolderItemsAsync(Guid folderId, string userId, int page, int pageSize, CancellationToken ct);
}
