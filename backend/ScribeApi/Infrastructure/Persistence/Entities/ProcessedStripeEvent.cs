namespace ScribeApi.Infrastructure.Persistence.Entities;

// Tracks processed Stripe webhook events to prevent duplicate processing
public class ProcessedStripeEvent
{
    public string EventId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public DateTime ProcessedAtUtc { get; set; }
}
