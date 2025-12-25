using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ScribeApi.Api.Extensions;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Transcriptions.Services;
using ScribeApi.Shared.Extensions;
using ScribeApi.Api.Filters;
using ScribeApi.Core.Interfaces;

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
    private readonly IJobTranslationService _translationService;
    private readonly IAnalysisService _analysisService;
    private readonly IMapper _mapper;

    public TranscriptionsController(
        ITranscriptionJobService jobService,
        ITranscriptionJobQueries queries,
        ITranscriptExportService exportService,
        ITranscriptEditService editService,
        IJobTranslationService translationService,
        IAnalysisService analysisService,
        IMapper mapper)
    {
        _jobService = jobService;
        _queries = queries;
        _exportService = exportService;
        _editService = editService;
        _translationService = translationService;
        _analysisService = analysisService;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<TranscriptionJobListItem>>> ListJobs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var (items, totalCount) = await _queries.GetUserJobsAsync(userId, page, pageSize, ct);

        var listItems = _mapper.Map<List<TranscriptionJobListItem>>(items);

        var response = new PagedResponse<TranscriptionJobListItem>(
            listItems, page, pageSize, totalCount);

        return Ok(response);
    }

    [HttpPost]
    [SkipTransaction]
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
    [SkipTransaction]
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

        var response = await _jobService.GetJobDetailsAsync(jobId, userId, ct);

        if (response == null)
            return NotFound();

        return Ok(response);
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

    [HttpPost("{jobId:guid}/translate")]
    public async Task<IActionResult> TranslateJob(
        Guid jobId,
        [FromBody] TranslateJobRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _translationService.EnqueueTranslationAsync(jobId, userId, request.TargetLanguage, ct);

        return Accepted();
    }

    [HttpPost("{jobId:guid}/analysis")]
    public async Task<ActionResult<List<TranscriptionAnalysisDto>>> GenerateAnalysis(
        Guid jobId,
        [FromBody] GenerateAnalysisRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _analysisService.GenerateAnalysisAsync(jobId, userId, request, ct);

        return Ok(result);
    }

    [HttpPost("{jobId:guid}/analysis/translate")]
    public async Task<ActionResult<List<TranscriptionAnalysisDto>>> TranslateAnalysis(
        Guid jobId,
        [FromBody] TranslateAnalysisRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _analysisService.TranslateAnalysisAsync(jobId, userId, request, ct);

        return Ok(result);
    }

    [HttpGet("{jobId:guid}/analysis")]
    public async Task<ActionResult<List<TranscriptionAnalysisDto>>> GetAnalysis(
        Guid jobId,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _analysisService.GetAnalysesAsync(jobId, userId, ct);

        return Ok(result);
    }
}
