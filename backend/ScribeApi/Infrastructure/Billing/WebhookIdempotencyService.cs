using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Interfaces;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Billing;

// Database-backed webhook idempotency service with race condition protection
public class WebhookIdempotencyService : IWebhookIdempotencyService
{
    private readonly AppDbContext _context;
    private readonly ILogger<WebhookIdempotencyService> _logger;

    public WebhookIdempotencyService(AppDbContext context, ILogger<WebhookIdempotencyService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> TryMarkAsProcessedAsync(string eventId, string eventType, CancellationToken ct = default)
    {
        // Validate Stripe event ID format
        if (string.IsNullOrEmpty(eventId) || !eventId.StartsWith("evt_"))
        {
            _logger.LogWarning("Invalid event ID format: {EventId}", eventId);
            return false;
        }

        try
        {
            _context.ProcessedStripeEvents.Add(new ProcessedStripeEvent
            {
                EventId = eventId,
                EventType = eventType,
                ProcessedAtUtc = DateTime.UtcNow
            });
            
            await _context.SaveChangesAsync(ct);
            return true;
        }
        catch (DbUpdateException)
        {
            // Unique constraint violation - event already processed
            _logger.LogDebug("Event {EventId} already processed, skipping", eventId);
            return false;
        }
    }
}
