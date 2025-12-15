using ScribeApi.Core.Domain.Plans;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Usage.Contracts;

public record UsageResponse(
    PlanType PlanType,
    UsageStats Usage,
    PlanLimits Limits
);

public record UsageStats(
    double UsedMinutesThisMonth,
    int JobsCleanedToday, // "DailyTranscriptionLimit" usage
    int ActiveJobs
);

public record PlanLimits(
    int? DailyTranscriptionLimit,
    int MaxMinutesPerFile,
    long MaxFileSizeBytes,
    int MaxConcurrentJobs,
    bool TranscriptionJobPriority
);
