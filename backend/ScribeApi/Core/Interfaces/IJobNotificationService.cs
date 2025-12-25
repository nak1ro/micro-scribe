namespace ScribeApi.Core.Interfaces;

// Abstraction for pushing job status updates to clients (currently via SignalR)
public interface IJobNotificationService
{
    // Notify status and processing step changes
    Task NotifyJobStatusAsync(Guid jobId, string userId, string status, string? processingStep);

    // Notify translation status changes
    Task NotifyTranslationStatusAsync(Guid jobId, string userId, string? status, string? language);

    // Notify job completed
    Task NotifyJobCompletedAsync(Guid jobId, string userId);

    // Notify job failed
    Task NotifyJobFailedAsync(Guid jobId, string userId, string errorMessage);
}
