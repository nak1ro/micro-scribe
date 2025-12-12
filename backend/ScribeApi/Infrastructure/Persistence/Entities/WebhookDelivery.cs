namespace ScribeApi.Infrastructure.Persistence.Entities;

public enum WebhookDeliveryStatus
{
    Pending = 0,
    Sent = 1,
    Failed = 2
}

public class WebhookDelivery
{
    public Guid Id { get; set; }
    
    public Guid SubscriptionId { get; set; }
    public required WebhookSubscription Subscription { get; set; }
    
    public required string Event { get; set; }
    public required string Payload { get; set; }
    
    public WebhookDeliveryStatus Status { get; set; } = WebhookDeliveryStatus.Pending;
    
    public int Attempts { get; set; }
    public int? ResponseStatusCode { get; set; }
    public string? ResponseBody { get; set; }
    
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastAttemptAtUtc { get; set; }
    public DateTime? NextRetryAtUtc { get; set; }
}
