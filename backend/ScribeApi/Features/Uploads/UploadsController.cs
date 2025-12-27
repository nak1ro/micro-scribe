using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ScribeApi.Api.Extensions;
using ScribeApi.Api.Filters;
using ScribeApi.Features.Uploads.Contracts;
using ScribeApi.Shared.Extensions;

namespace ScribeApi.Features.Uploads;

[Authorize]
[ApiController]
[Route("api/uploads/sessions")]
public class UploadsController : ControllerBase
{
    private readonly IUploadService _uploadService;

    public UploadsController(IUploadService uploadService)
    {
        _uploadService = uploadService;
    }

    [HttpPost]
    [SkipTransaction] // Uses Serializable isolation level for plan limit enforcement
    public async Task<ActionResult<UploadSessionResponse>> InitiateUpload(
        [FromBody] InitiateUploadRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        var result = await _uploadService.InitiateUploadAsync(request, userId, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<UploadSessionStatusResponse>> CompleteUpload(
        Guid id,
        [FromBody] CompleteUploadRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        var result = await _uploadService.CompleteUploadAsync(id, request, userId, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UploadSessionStatusResponse>> GetStatus(
        Guid id,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        var result = await _uploadService.GetSessionStatusAsync(id, userId, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> AbortUpload(
        Guid id,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        await _uploadService.AbortSessionAsync(id, userId, ct);
        return NoContent();
    }
}
