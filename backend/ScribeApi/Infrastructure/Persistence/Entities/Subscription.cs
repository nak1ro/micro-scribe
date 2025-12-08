namespace ScribeApi.Infrastructure.Persistence.Entities;

public enum PlanType
{
    Free = 0,
    Pro = 1
}

public enum SubscriptionStatus
{
    Active = 0,
    Canceled = 1,
    PastDue = 2,
    Incomplete = 3,
    IncompleteExpired = 4,
    Trialing = 5
}

public class Subscription
{
    public Guid Id { get; set; }

    public required string UserId { get; set; }
    public required ApplicationUser User { get; set; }

    public PlanType Plan { get; set; } = PlanType.Free;

    public required string StripeCustomerId { get; set; }
    public required string StripeSubscriptionId { get; set; }

    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    public DateTime CurrentPeriodStartUtc { get; set; }
    public DateTime CurrentPeriodEndUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CanceledAtUtc { get; set; }
}