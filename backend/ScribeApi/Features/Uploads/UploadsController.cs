using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScribeApi.Features.Uploads.Contracts;

namespace ScribeApi.Features.Uploads;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadsController : ControllerBase
{
    private readonly IUploadService _uploadService;

    public UploadsController(IUploadService uploadService)
    {
        _uploadService = uploadService;
    }

    [HttpPost("sessions")]
    public async Task<ActionResult<UploadSessionDto>> CreateSession(
        [FromBody] InitUploadRequest request,
        CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var session = await _uploadService.CreateSessionAsync(userId!, request, ct);

        return Ok(new UploadSessionDto(
            session.Id,
            session.StorageKeyPrefix,
            session.Status,
            session.ExpiresAtUtc
        ));
    }

    [HttpPut("sessions/{sessionId:guid}/chunks/{chunkIndex:int}")]
    public async Task<ActionResult<MediaFileDto>> UploadChunk(
        [FromRoute] Guid sessionId,
        [FromRoute] int chunkIndex,
        [FromForm] IFormFile? chunk,
        CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (chunk == null || chunk.Length == 0)
        {
            return BadRequest("No chunk data provided.");
        }

        await using var stream = chunk.OpenReadStream();

        var mediaFile = await _uploadService.UploadChunkAsync(sessionId, chunkIndex, stream, userId!, ct);

        if (mediaFile != null)
        {
            return Ok(new MediaFileDto(
                mediaFile.Id,
                mediaFile.OriginalFileName,
                mediaFile.ContentType,
                mediaFile.SizeBytes,
                mediaFile.CreatedAtUtc
            ));
        }

        return Accepted(new { Message = "Chunk received" });
    }
}