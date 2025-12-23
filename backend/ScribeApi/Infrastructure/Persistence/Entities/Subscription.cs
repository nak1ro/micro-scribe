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
    // Unique identifier
    public Guid Id { get; set; }

    // FK to owning user
    public required string UserId { get; set; }

    // Stripe customer identifier
    public required string StripeCustomerId { get; set; }

    // Stripe subscription identifier
    public required string StripeSubscriptionId { get; set; }

    // Current subscription status
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    // Start of current billing period
    public DateTime CurrentPeriodStartUtc { get; set; }

    // End of current billing period
    public DateTime CurrentPeriodEndUtc { get; set; }

    // When the subscription was created
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // When the subscription was canceled
    public DateTime? CanceledAtUtc { get; set; }

    // Nav
    public required ApplicationUser User { get; set; }
}