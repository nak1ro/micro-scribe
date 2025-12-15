using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScribeApi.Core.Domain.Plans;
using ScribeApi.Core.Exceptions;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Usage.Contracts;
using ScribeApi.Shared.Extensions;

namespace ScribeApi.Features.Usage;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsageController : ControllerBase
{
    private readonly ITranscriptionJobQueries _queries;
    private readonly IPlanResolver _planResolver;

    public UsageController(ITranscriptionJobQueries queries, IPlanResolver planResolver)
    {
        _queries = queries;
        _planResolver = planResolver;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UsageResponse>> GetUsage(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _queries.GetUserByIdAsync(userId, ct);
        if (user == null) return NotFound();

        var plan = _planResolver.GetPlanDefinition(user.Plan);

        var dailyJobs = await _queries.CountDailyJobsAsync(userId, DateTime.UtcNow, ct);
        var activeJobs = await _queries.CountActiveJobsAsync(userId, ct);

        var stats = new UsageStats(
            user.UsedMinutesThisMonth,
            dailyJobs,
            activeJobs
        );

        var limits = new PlanLimits(
            plan.DailyTranscriptionLimit,
            plan.MaxMinutesPerFile,
            plan.MaxFileSizeBytes,
            plan.MaxConcurrentJobs,
            plan.TranscriptionJobPriority
        );

        return Ok(new UsageResponse(user.Plan, stats, limits));
    }
}