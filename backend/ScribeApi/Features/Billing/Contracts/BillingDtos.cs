using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Billing.Contracts;

public enum BillingInterval
{
    Monthly,
    Yearly
}

// Request to create a SetupIntent for collecting payment method
public record CreateSetupIntentRequest(BillingInterval Interval = BillingInterval.Monthly);

// Response with SetupIntent client secret for frontend
public record SetupIntentResponse(string ClientSecret);

// Request to confirm subscription after payment method collected
public record ConfirmSubscriptionRequest(string PaymentMethodId, BillingInterval Interval = BillingInterval.Monthly);

// Response after subscription created
public record SubscriptionResponse(string SubscriptionId, string Status);

// Response with billing portal URL
public record PortalSessionResponse(string Url);

// Request to create a billing portal session
public record CreatePortalSessionRequest(string? ReturnUrl = null);

// Current subscription status for a user
public record SubscriptionStatusDto(
    PlanType Plan,
    SubscriptionStatus Status,
    DateTime? CurrentPeriodEnd,
    bool CancelAtPeriodEnd
);

// Publishable key for frontend Stripe initialization
public record StripePublicKeyResponse(string PublishableKey);
