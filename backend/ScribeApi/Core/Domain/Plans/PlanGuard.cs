using ScribeApi.Core.Exceptions;

namespace ScribeApi.Core.Domain.Plans;

public interface IPlanGuard
{
    void EnsureFileSize(PlanDefinition plan, long sizeBytes);
    void EnsureAudioDuration(PlanDefinition plan, double durationSeconds);
    void EnsureDailyTranscriptionLimit(PlanDefinition plan, int currentDailyCount);
    void EnsureConcurrentJobs(PlanDefinition plan, int activeJobsCount);
    void EnsureTranslationAllowed(PlanDefinition plan);
    void EnsureModelAllowed(PlanDefinition plan);
}

public class PlanGuard : IPlanGuard
{
    public void EnsureFileSize(PlanDefinition plan, long sizeBytes)
    {
        if (sizeBytes > plan.MaxFileSizeBytes)
        {
            throw new PlanLimitExceededException(
                $"File size ({sizeBytes} bytes) exceeds plan limit of {plan.MaxFileSizeBytes} bytes.");
        }
    }

    public void EnsureAudioDuration(PlanDefinition plan, double durationSeconds)
    {
        var maxSeconds = plan.MaxMinutesPerFile * 60;
        if (durationSeconds > maxSeconds)
        {
            throw new PlanLimitExceededException(
                $"Audio duration ({durationSeconds:F1}s) exceeds plan limit of {plan.MaxMinutesPerFile} minutes.");
        }
    }

    public void EnsureDailyTranscriptionLimit(PlanDefinition plan, int currentDailyCount)
    {
        if (plan.DailyTranscriptionLimit.HasValue && currentDailyCount >= plan.DailyTranscriptionLimit.Value)
        {
            throw new PlanLimitExceededException(
                $"Daily transcription limit of {plan.DailyTranscriptionLimit.Value} files reached.");
        }
    }

    public void EnsureConcurrentJobs(PlanDefinition plan, int activeJobsCount)
    {
        if (activeJobsCount >= plan.MaxConcurrentJobs)
        {
            throw new PlanLimitExceededException(
                $"Concurrent job limit of {plan.MaxConcurrentJobs} reached. Please wait for a job to finish.");
        }
    }

    public void EnsureTranslationAllowed(PlanDefinition plan)
    {
        if (!plan.AllowTranslation)
        {
            throw new PlanLimitExceededException("Translation is not allowed on your current plan.");
        }
    }

    public void EnsureModelAllowed(PlanDefinition plan)
    {
        if (!plan.AllowAllModels)
        {
            throw new PlanLimitExceededException("Model selection is not allowed on your current plan.");
        }
    }
}
