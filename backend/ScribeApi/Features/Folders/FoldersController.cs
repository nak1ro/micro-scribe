using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScribeApi.Features.Folders.Contracts;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Shared.Extensions;

namespace ScribeApi.Features.Folders;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FoldersController : ControllerBase
{
    private readonly IFolderService _folderService;

    public FoldersController(IFolderService folderService)
    {
        _folderService = folderService;
    }

    [HttpGet]
    public async Task<ActionResult<List<FolderDto>>> ListFolders(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var folders = await _folderService.ListFoldersAsync(userId, ct);
        return Ok(folders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FolderDto>> GetFolder(Guid id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var folder = await _folderService.GetFolderAsync(id, userId, ct);
        return Ok(folder);
    }

    [HttpPost]
    public async Task<ActionResult<FolderDto>> CreateFolder(
        [FromBody] CreateFolderRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var folder = await _folderService.CreateFolderAsync(userId, request, ct);
        return CreatedAtAction(nameof(GetFolder), new { id = folder.Id }, folder);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<FolderDto>> UpdateFolder(
        Guid id,
        [FromBody] UpdateFolderRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var folder = await _folderService.UpdateFolderAsync(id, userId, request, ct);
        return Ok(folder);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteFolder(Guid id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _folderService.DeleteFolderAsync(id, userId, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItems(
        Guid id,
        [FromBody] UpdateFolderItemsRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _folderService.AddItemsAsync(id, userId, request.TranscriptionJobIds, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}/items")]
    public async Task<IActionResult> RemoveItems(
        Guid id,
        [FromBody] UpdateFolderItemsRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _folderService.RemoveItemsAsync(id, userId, request.TranscriptionJobIds, ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/items")]
    public async Task<ActionResult<PagedResponse<TranscriptionJobListItem>>> GetFolderItems(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var items = await _folderService.GetFolderItemsAsync(id, userId, page, pageSize, ct);
        return Ok(items);
    }
}
