using Microsoft.EntityFrameworkCore;
using ScribeApi.Features.Billing.Contracts;
using ScribeApi.Infrastructure.Billing;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Billing.Services;

// Core billing business logic and subscription management
public class BillingService : IBillingService
{
    private readonly AppDbContext _context;
    private readonly StripeClient _stripeClient;
    private readonly ILogger<BillingService> _logger;

    public BillingService(
        AppDbContext context,
        StripeClient stripeClient,
        ILogger<BillingService> logger)
    {
        _context = context;
        _stripeClient = stripeClient;
        _logger = logger;
    }

    public async Task<CheckoutSessionResponse> CreateCheckoutSessionAsync(
        string userId,
        CreateCheckoutSessionRequest request,
        CancellationToken ct = default)
    {
        var customerId = await EnsureStripeCustomerAsync(userId, ct);

        var session = await _stripeClient.CreateCheckoutSessionAsync(
            customerId,
            request.SuccessUrl,
            request.CancelUrl,
            ct);

        _logger.LogInformation("Created checkout session {SessionId} for user {UserId}", session.Id, userId);

        return new CheckoutSessionResponse(session.Id, session.Url);
    }

    public async Task<PortalSessionResponse> CreatePortalSessionAsync(
        string userId,
        string? returnUrl = null,
        CancellationToken ct = default)
    {
        var customerId = await EnsureStripeCustomerAsync(userId, ct);

        var session = await _stripeClient.CreatePortalSessionAsync(customerId, returnUrl, ct);

        _logger.LogInformation("Created portal session for user {UserId}", userId);

        return new PortalSessionResponse(session.Url);
    }

    public async Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(
        string userId,
        CancellationToken ct = default)
    {
        var user = await _context.Users
            .OfType<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null)
        {
            return new SubscriptionStatusDto(
                PlanType.Free,
                SubscriptionStatus.Active,
                null,
                false,
                null);
        }

        // Get active subscription from DB
        var subscription = await _context.Subscriptions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        if (subscription == null)
        {
            return new SubscriptionStatusDto(
                user.Plan,
                SubscriptionStatus.Active,
                null,
                false,
                user.StripeCustomerId);
        }

        // Check if cancel at period end from Stripe
        var cancelAtPeriodEnd = false;
        
        if (string.IsNullOrEmpty(subscription.StripeSubscriptionId))
            return new SubscriptionStatusDto(
                subscription.Plan,
                subscription.Status,
                subscription.CurrentPeriodEndUtc,
                cancelAtPeriodEnd,
                user.StripeCustomerId);
        
        var stripeSubscription = await _stripeClient.GetSubscriptionAsync(subscription.StripeSubscriptionId, ct);
        cancelAtPeriodEnd = stripeSubscription?.CancelAtPeriodEnd ?? false;

        return new SubscriptionStatusDto(
            subscription.Plan,
            subscription.Status,
            subscription.CurrentPeriodEndUtc,
            cancelAtPeriodEnd,
            user.StripeCustomerId);
    }

    public async Task<string> EnsureStripeCustomerAsync(string userId, CancellationToken ct = default)
    {
        var user = await _context.Users
            .OfType<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new InvalidOperationException($"User {userId} not found");

        if (!string.IsNullOrEmpty(user.StripeCustomerId))
        {
            return user.StripeCustomerId;
        }

        // Create new Stripe customer
        var customer = await _stripeClient.CreateCustomerAsync(user.Email!, user.UserName, ct);

        user.StripeCustomerId = customer.Id;
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Created Stripe customer {CustomerId} for user {UserId}", customer.Id, userId);

        return customer.Id;
    }
}
