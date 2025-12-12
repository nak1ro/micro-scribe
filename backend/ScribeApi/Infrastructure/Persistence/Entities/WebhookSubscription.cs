namespace ScribeApi.Infrastructure.Persistence.Entities;

public class WebhookSubscription
{
    public Guid Id { get; set; }
    
    public required string UserId { get; set; }
    public required ApplicationUser User { get; set; }
    
    public required string Url { get; set; }
    public required string Secret { get; set; }
    
    public List<string> Events { get; set; } = [];
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastTriggeredAtUtc { get; set; }
    
    public ICollection<WebhookDelivery> Deliveries { get; set; } = new List<WebhookDelivery>();
}
