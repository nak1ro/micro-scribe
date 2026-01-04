namespace ScribeApi.Features.Billing.Contracts;

// Service interface for billing operations
public interface IBillingService
{
    // Create a SetupIntent for collecting payment method via Elements
    Task<SetupIntentResponse> CreateSetupIntentAsync(
        string userId,
        CreateSetupIntentRequest request,
        CancellationToken ct = default);

    // Confirm subscription after payment method collected
    Task<SubscriptionResponse> ConfirmSubscriptionAsync(
        string userId,
        ConfirmSubscriptionRequest request,
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

    // Cancel the user's subscription
    Task<bool> CancelSubscriptionAsync(string userId, bool cancelImmediately = false, CancellationToken ct = default);

    // Change subscription plan (Monthly ↔ Annual)
    Task<SubscriptionResponse> ChangeSubscriptionPlanAsync(string userId, BillingInterval newInterval, CancellationToken ct = default);

    // Get user's default payment method
    Task<PaymentMethodResponse?> GetPaymentMethodAsync(string userId, CancellationToken ct = default);

    // Get user's invoice history
    Task<InvoiceListResponse> GetInvoicesAsync(string userId, int limit = 10, string? startingAfter = null, CancellationToken ct = default);
}
