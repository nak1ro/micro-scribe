using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScribeApi.Common.Extensions;
using ScribeApi.Features.Media.Contracts;

namespace ScribeApi.Features.Media;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly IMediaService _mediaService;

    public MediaController(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<MediaFileDto>>> ListAsync(
        [FromQuery] MediaListRequest request,
        CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        var result = await _mediaService.ListMediaFilesAsync(userId, request.Page, request.PageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MediaFileDto>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        var result = await _mediaService.GetMediaFileAsync(id, userId, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        await _mediaService.DeleteMediaFileAsync(id, userId, ct);
        return NoContent();
    }
}
