using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using ScribeApi.Shared.Extensions;

namespace ScribeApi.Infrastructure.SignalR;

// SignalR hub for real-time transcription status updates
[Authorize]
public class TranscriptionHub : Hub
{
    private readonly ILogger<TranscriptionHub> _logger;

    public TranscriptionHub(ILogger<TranscriptionHub> logger)
    {
        _logger = logger;
    }

    // Clients automatically join their user group on connect
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.GetUserId();
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
            _logger.LogDebug("Client {ConnectionId} joined user group {UserId}", Context.ConnectionId, userId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.GetUserId();
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
            _logger.LogDebug("Client {ConnectionId} left user group {UserId}", Context.ConnectionId, userId);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
