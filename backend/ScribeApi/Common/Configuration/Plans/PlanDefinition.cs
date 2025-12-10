using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Common.Configuration.Plans;

public class PlanDefinition
{
    public PlanType PlanType { get; set; }

    // Limits
    public int? DailyTranscriptionLimit { get; set; }     
    public int MaxMinutesPerFile { get; set; }
    public long MaxFileSizeBytes { get; set; }
    public int MaxFilesPerUpload { get; set; }
    public int MaxConcurrentJobs { get; set; }

    // Feature flags
    public bool AllowTranslation { get; set; }
    public bool AllowAllModels { get; set; }
    public bool UnlimitedStorage { get; set; }
}