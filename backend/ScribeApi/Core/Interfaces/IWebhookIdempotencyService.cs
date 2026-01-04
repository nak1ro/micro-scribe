namespace ScribeApi.Core.Interfaces;

// Service for ensuring webhook events are processed only once
public interface IWebhookIdempotencyService
{
    // Returns true if event was marked (first time), false if already processed
    Task<bool> TryMarkAsProcessedAsync(string eventId, string eventType, CancellationToken ct = default);
}
