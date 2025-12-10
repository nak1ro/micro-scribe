using AutoMapper;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScribeApi.Common.Extensions;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Features.Uploads.Contracts;

namespace ScribeApi.Features.Uploads;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadsController : ControllerBase
{
    private readonly IUploadService _uploadService;
    private readonly IMapper _mapper;
    private readonly IValidator<UploadChunkRequest> _uploadChunkValidator;

    public UploadsController(
        IUploadService uploadService,
        IMapper mapper,
        IValidator<UploadChunkRequest> uploadChunkValidator)
    {
        _uploadService = uploadService;
        _mapper = mapper;
        _uploadChunkValidator = uploadChunkValidator;
    }

    [HttpPost("sessions")]
    public async Task<ActionResult<UploadSessionDto>> CreateSession(
        [FromBody] InitUploadRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();

        var session = await _uploadService.CreateSessionAsync(userId, request, ct);

        return Ok(_mapper.Map<UploadSessionDto>(session));
    }

    [HttpPut("sessions/{sessionId:guid}/chunks/{chunkIndex:int}")]
    public async Task<ActionResult<MediaFileDto>> UploadChunk(
        [AsParameters] UploadChunkRequest request,
        CancellationToken ct)
    {
        var validationResult = await _uploadChunkValidator.ValidateAsync(request, ct);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var userId = User.GetUserId();

        await using var stream = request.Chunk.OpenReadStream();

        var mediaFile = await _uploadService.UploadChunkAsync(request.SessionId, request.ChunkIndex, stream, userId, ct);

        if (mediaFile != null)
        {
            return Ok(_mapper.Map<MediaFileDto>(mediaFile));
        }

        return Accepted(new { Message = "Chunk received" });
    }
}