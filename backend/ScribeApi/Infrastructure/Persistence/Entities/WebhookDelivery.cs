namespace ScribeApi.Infrastructure.Persistence.Entities;

public enum WebhookDeliveryStatus
{
    Pending = 0,
    Sent = 1,
    Failed = 2
}

public class WebhookDelivery
{
    // Unique identifier
    public Guid Id { get; set; }

    // FK to parent subscription
    public Guid SubscriptionId { get; set; }

    // Event type being delivered
    public required string Event { get; set; }

    // JSON payload content
    public required string Payload { get; set; }

    // Current delivery status
    public WebhookDeliveryStatus Status { get; set; } = WebhookDeliveryStatus.Pending;

    // Number of delivery attempts
    public int Attempts { get; set; }

    // HTTP status code from last attempt
    public int? ResponseStatusCode { get; set; }

    // Response body from last attempt
    public string? ResponseBody { get; set; }

    // When delivery was created
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // When last delivery attempt occurred
    public DateTime? LastAttemptAtUtc { get; set; }

    // Scheduled time for next retry
    public DateTime? NextRetryAtUtc { get; set; }

    // Nav
    public required WebhookSubscription Subscription { get; set; }
}
