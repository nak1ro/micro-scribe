using Microsoft.AspNetCore.SignalR;
using ScribeApi.Core.Interfaces;

namespace ScribeApi.Infrastructure.SignalR;

// SignalR implementation for pushing job notifications to clients
public class SignalRNotificationService : IJobNotificationService
{
    private readonly IHubContext<TranscriptionHub> _hubContext;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(
        IHubContext<TranscriptionHub> hubContext,
        ILogger<SignalRNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyJobStatusAsync(Guid jobId, string userId, string status, string? processingStep)
    {
        _logger.LogDebug("Pushing JobStatusUpdate to user {UserId}: {Status}/{Step}", userId, status, processingStep);
        await _hubContext.Clients.Group($"user-{userId}").SendAsync("JobStatusUpdate", new
        {
            JobId = jobId,
            Status = status,
            ProcessingStep = processingStep
        });
    }

    public async Task NotifyTranslationStatusAsync(Guid jobId, string userId, string? status, string? language)
    {
        _logger.LogDebug("Pushing TranslationStatusUpdate to user {UserId}: {Status}/{Lang}", userId, status, language);
        await _hubContext.Clients.Group($"user-{userId}").SendAsync("TranslationStatusUpdate", new
        {
            JobId = jobId,
            TranslationStatus = status,
            TranslatingToLanguage = language
        });
    }

    public async Task NotifyJobCompletedAsync(Guid jobId, string userId)
    {
        _logger.LogDebug("Pushing JobCompleted to user {UserId}", userId);
        await _hubContext.Clients.Group($"user-{userId}").SendAsync("JobCompleted", new
        {
            JobId = jobId
        });
    }

    public async Task NotifyJobFailedAsync(Guid jobId, string userId, string errorMessage)
    {
        _logger.LogDebug("Pushing JobFailed to user {UserId}: {Error}", userId, errorMessage);
        await _hubContext.Clients.Group($"user-{userId}").SendAsync("JobFailed", new
        {
            JobId = jobId,
            ErrorMessage = errorMessage
        });
    }
}
