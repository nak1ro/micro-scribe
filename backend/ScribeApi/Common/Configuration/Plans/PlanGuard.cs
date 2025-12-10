using ScribeApi.Common.Exceptions;

namespace ScribeApi.Common.Configuration.Plans;

public interface IPlanGuard
{
    void EnsureFileSize(PlanDefinition plan, long sizeBytes);
    void EnsureConcurrentUploads(PlanDefinition plan, int currentCount);
    void EnsureConcurrentJobs(PlanDefinition plan, int currentCount);
    void EnsureDailyUploadLimit(PlanDefinition plan, int currentDailyCount);
    void EnsureAudioDuration(PlanDefinition plan, double durationSeconds);
}

public class PlanGuard : IPlanGuard
{
    public void EnsureFileSize(PlanDefinition plan, long sizeBytes)
    {
        if (sizeBytes > plan.MaxFileSizeBytes)
        {
            throw new PlanLimitExceededException(
                $"File size ({sizeBytes / 1024 / 1024} MB) exceeds the limit of {plan.MaxFileSizeBytes / 1024 / 1024} MB for your plan.");
        }
    }

    public void EnsureConcurrentUploads(PlanDefinition plan, int currentCount)
    {
        if (currentCount >= plan.MaxFilesPerUpload)
        {
            throw new PlanLimitExceededException(
                $"You have reached the maximum number of active uploads ({plan.MaxFilesPerUpload}) for your plan.");
        }
    }

    public void EnsureConcurrentJobs(PlanDefinition plan, int currentCount)
    {
        if (currentCount >= plan.MaxConcurrentJobs)
        {
            throw new PlanLimitExceededException(
                $"You have {currentCount} active jobs. " +
                $"Maximum allowed: {plan.MaxConcurrentJobs}. " +
                "Please wait for current jobs to complete or upgrade your plan.");
        }
    }

    public void EnsureAudioDuration(PlanDefinition plan, double durationSeconds)
    {
        var durationMinutes = durationSeconds / 60.0;
        if (durationMinutes > plan.MaxMinutesPerFile)
        {
            throw new PlanLimitExceededException(
                $"Audio duration ({durationMinutes:F1} min) exceeds plan limit " +
                $"({plan.MaxMinutesPerFile} min/file).");
        }
    }

    public void EnsureDailyUploadLimit(PlanDefinition plan, int currentDailyCount)
    {
        if (plan.DailyTranscriptionLimit.HasValue && currentDailyCount >= plan.DailyTranscriptionLimit.Value)
        {
            throw new PlanLimitExceededException(
                $"You have reached the daily limit of {plan.DailyTranscriptionLimit.Value} files for your plan.");
        }
    }
}
