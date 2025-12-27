using ScribeApi.Features.Media.Contracts;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Folders.Contracts;

// Folder list/detail response
public class FolderDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public FolderColor Color { get; init; }
    public int ItemCount { get; init; }
    public DateTime CreatedAtUtc { get; init; }
}

// Lightweight folder reference for transcription list
public class FolderSummaryDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public FolderColor Color { get; init; }
}

// Create folder request
public record CreateFolderRequest(string Name, FolderColor Color = FolderColor.Blue);

// Update folder request
public record UpdateFolderRequest(string Name, FolderColor Color);

// Bulk add/remove items request
public record UpdateFolderItemsRequest(List<Guid> TranscriptionJobIds);
