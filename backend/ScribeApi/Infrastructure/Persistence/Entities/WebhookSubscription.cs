namespace ScribeApi.Infrastructure.Persistence.Entities;

public class WebhookSubscription
{
    // Unique identifier
    public Guid Id { get; set; }

    // FK to owning user
    public required string UserId { get; set; }

    // Webhook endpoint URL
    public required string Url { get; set; }

    // HMAC secret for signature verification
    public required string Secret { get; set; }

    // List of subscribed event types
    public List<string> Events { get; set; } = [];

    // Whether subscription is active
    public bool IsActive { get; set; } = true;

    // When subscription was created
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // When webhook was last triggered
    public DateTime? LastTriggeredAtUtc { get; set; }

    // Nav
    public required ApplicationUser User { get; set; }
    public ICollection<WebhookDelivery> Deliveries { get; set; } = new List<WebhookDelivery>();
}
