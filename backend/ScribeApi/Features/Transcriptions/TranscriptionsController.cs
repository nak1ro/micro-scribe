using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Shared.Extensions;

namespace ScribeApi.Features.Transcriptions;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TranscriptionsController : ControllerBase
{
    private readonly ITranscriptionJobService _jobService;
    private readonly ITranscriptionJobQueries _queries;

    public TranscriptionsController(
        ITranscriptionJobService jobService,
        ITranscriptionJobQueries queries)
    {
        _jobService = jobService;
        _queries = queries;
    }

    [HttpPost]
    public async Task<ActionResult<TranscriptionJobResponse>> CreateJob(
        [FromBody] CreateTranscriptionJobRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _jobService.StartJobAsync(userId, request, ct);

        return CreatedAtAction(
            nameof(GetJob), 
            new { jobId = result.JobId }, 
            result);
    }

    [HttpGet("{jobId:guid}")]
    public async Task<ActionResult<TranscriptionJobDetailResponse>> GetJob(
        Guid jobId,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var job = await _queries.GetJobWithMediaAsync(jobId, ct);

        if (job == null || job.UserId != userId)
        {
            return NotFound();
        }

        var response = new TranscriptionJobDetailResponse(
            job.Id,
            job.MediaFileId,
            job.MediaFile.OriginalFileName,
            job.Status,
            job.Quality,
            job.LanguageCode,
            job.Transcript,
            job.ErrorMessage,
            job.DurationSeconds,
            job.CreatedAtUtc,
            job.StartedAtUtc,
            job.CompletedAtUtc
        );

        return Ok(response);
    }
}
