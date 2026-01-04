using ScribeApi.Core.Exceptions;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Core.Domain.Plans;

public interface IPlanGuard
{
    void EnsureFileSize(PlanDefinition plan, long sizeBytes);
    void EnsureAudioDuration(PlanDefinition plan, double durationSeconds);
    void EnsureDailyTranscriptionLimit(PlanDefinition plan, int currentDailyCount);
    void EnsureConcurrentJobs(PlanDefinition plan, int activeJobsCount);
    void EnsureTranslationAllowed(PlanDefinition plan);
    void EnsureQualityAllowed(PlanDefinition plan, TranscriptionQuality quality);
    void EnsureExportAllowed(PlanDefinition plan, string formatName);
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
            throw new PlanLimitExceededException("Translation is not available on your plan. Upgrade to Pro.");
        }
    }

    public void EnsureQualityAllowed(PlanDefinition plan, TranscriptionQuality quality)
    {
        if (!plan.AllowAllModels && quality != TranscriptionQuality.Balanced)
        {
            throw new PlanLimitExceededException(
                "Only Balanced quality is available on your plan. Upgrade to Pro for Fast/Accurate.");
        }
    }

    public void EnsureExportAllowed(PlanDefinition plan, string formatName)
    {
        if (!plan.AllowedExportFormats.Contains(formatName, StringComparer.OrdinalIgnoreCase))
        {
            throw new PlanLimitExceededException(
                $"Export format '{formatName}' is not available on your plan. Upgrade to Pro.");
        }
    }
}


