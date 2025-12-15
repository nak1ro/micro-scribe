using ScribeApi.Core.Domain.Plans;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Usage.Contracts;

namespace ScribeApi.Features.Usage.Services;

public class UsageService : IUsageService
{
    private readonly ITranscriptionJobQueries _queries;
    private readonly IPlanResolver _planResolver;

    public UsageService(ITranscriptionJobQueries queries, IPlanResolver planResolver)
    {
        _queries = queries;
        _planResolver = planResolver;
    }

    public async Task<UsageResponse?> GetUsageAsync(string userId, CancellationToken ct)
    {
        var user = await _queries.GetUserByIdAsync(userId, ct);
        if (user == null) return null;

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

        return new UsageResponse(user.Plan, stats, limits);
    }
}