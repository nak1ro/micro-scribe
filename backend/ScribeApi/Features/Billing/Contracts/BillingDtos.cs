using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Billing.Contracts;

// Request to create a checkout session
public record CreateCheckoutSessionRequest(
    string? SuccessUrl = null,
    string? CancelUrl = null
);

// Response with checkout session URL
public record CheckoutSessionResponse(string SessionId, string Url);

// Response with billing portal URL
public record PortalSessionResponse(string Url);

// Request to create a billing portal session
public record CreatePortalSessionRequest(string? ReturnUrl = null);

// Current subscription status for a user
public record SubscriptionStatusDto(
    PlanType Plan,
    SubscriptionStatus Status,
    DateTime? CurrentPeriodEnd,
    bool CancelAtPeriodEnd,
    string? StripeCustomerId
);

// Publishable key for frontend Stripe initialization
public record StripePublicKeyResponse(string PublishableKey);
