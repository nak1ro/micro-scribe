namespace ScribeApi.Features.Billing.Contracts;

// Service interface for billing operations
public interface IBillingService
{
    // Create a checkout session for upgrading to Pro
    Task<CheckoutSessionResponse> CreateCheckoutSessionAsync(
        string userId,
        CreateCheckoutSessionRequest request,
        CancellationToken ct = default);

    // Create a billing portal session for subscription management
    Task<PortalSessionResponse> CreatePortalSessionAsync(
        string userId,
        string? returnUrl = null,
        CancellationToken ct = default);

    // Get the current subscription status for a user
    Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(
        string userId,
        CancellationToken ct = default);

    // Ensure user has a Stripe customer ID, creating one if needed
    Task<string> EnsureStripeCustomerAsync(string userId, CancellationToken ct = default);
}
