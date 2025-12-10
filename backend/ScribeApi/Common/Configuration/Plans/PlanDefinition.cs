using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Common.Configuration.Plans;

public class PlanDefinition
{
    public PlanType PlanType { get; set; }

    // Limits

    // Number of transcriptions a user can do in 24h
    public int? DailyTranscriptionLimit { get; set; }

    // Max length of a single file that a user uploads in minutes
    public int MaxMinutesPerFile { get; set; }

    // Max size of a single file that a user uploads in bytes
    public long MaxFileSizeBytes { get; set; }
    
    // Max number of concurrent transcription jobs a user can have
    public int MaxConcurrentJobs { get; set; }

    // Does a user get priority in job transcription
    public bool TranscriptionJobPriority { get; set; }

    // Future flags - don't implement now 
    public bool AllowTranslation { get; set; }
    public bool AllowAllModels { get; set; }
    public bool UnlimitedStorage { get; set; }
}