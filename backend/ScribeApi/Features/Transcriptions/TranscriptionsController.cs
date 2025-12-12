using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Transcriptions.Services;
using ScribeApi.Shared.Extensions;

namespace ScribeApi.Features.Transcriptions;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TranscriptionsController : ControllerBase
{
    private readonly ITranscriptionJobService _jobService;
    private readonly ITranscriptionJobQueries _queries;
    private readonly ITranscriptExportService _exportService;
    private readonly ITranscriptEditService _editService;
    private readonly IMapper _mapper;

    public TranscriptionsController(
        ITranscriptionJobService jobService,
        ITranscriptionJobQueries queries,
        ITranscriptExportService exportService,
        ITranscriptEditService editService,
        IMapper mapper)
    {
        _jobService = jobService;
        _queries = queries;
        _exportService = exportService;
        _editService = editService;
        _mapper = mapper;
    }

    [HttpPost]
    public async Task<ActionResult<TranscriptionJobResponse>> CreateJob(
        [FromBody] CreateTranscriptionJobRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _jobService.StartJobAsync(userId, request, ct);

        return CreatedAtAction(nameof(GetJob), new { jobId = result.JobId }, result);
    }

    [HttpPost("{jobId:guid}/cancel")]
    public async Task<IActionResult> CancelJob(Guid jobId, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _jobService.CancelJobAsync(jobId, userId, ct);

        return NoContent();
    }

    [HttpGet("{jobId:guid}")]
    public async Task<ActionResult<TranscriptionJobDetailResponse>> GetJob(Guid jobId, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var job = await _queries.GetJobWithSegmentsAsync(jobId, ct);

        if (job == null || job.UserId != userId)
            return NotFound();

        return Ok(_mapper.Map<TranscriptionJobDetailResponse>(job));
    }

    [HttpGet("{jobId:guid}/export")]
    public async Task<IActionResult> ExportTranscript(
        Guid jobId,
        [FromQuery] ExportFormat format = ExportFormat.Txt,
        CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _exportService.ExportAsync(jobId, userId, format, ct);

        return File(result.Content, result.ContentType, result.FileName);
    }

    [HttpPatch("{jobId:guid}/segments/{segmentId:guid}")]
    public async Task<ActionResult<TranscriptSegmentDto>> UpdateSegment(
        Guid jobId,
        Guid segmentId,
        [FromBody] UpdateSegmentRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _editService.UpdateSegmentAsync(jobId, segmentId, userId, request, ct);

        return Ok(result);
    }

    [HttpPost("{jobId:guid}/segments/{segmentId:guid}/revert")]
    public async Task<ActionResult<TranscriptSegmentDto>> RevertSegment(
        Guid jobId,
        Guid segmentId,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _editService.RevertSegmentAsync(jobId, segmentId, userId, ct);

        return Ok(result);
    }
}
