using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
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
    private readonly StripeSettings _stripeSettings;
    private readonly ILogger<BillingService> _logger;

    public BillingService(
        AppDbContext context,
        StripeClient stripeClient,
        IOptions<StripeSettings> stripeSettings,
        ILogger<BillingService> logger)
    {
        _context = context;
        _stripeClient = stripeClient;
        _stripeSettings = stripeSettings.Value;
        _logger = logger;
    }

    public async Task<SetupIntentResponse> CreateSetupIntentAsync(
        string userId,
        CreateSetupIntentRequest request,
        CancellationToken ct = default)
    {
        var customerId = await EnsureStripeCustomerAsync(userId, ct);
        var setupIntent = await _stripeClient.CreateSetupIntentAsync(customerId, ct);

        _logger.LogInformation("Created SetupIntent {SetupIntentId} for user {UserId}", setupIntent.Id, userId);

        return new SetupIntentResponse(setupIntent.ClientSecret);
    }

    public async Task<SubscriptionResponse> ConfirmSubscriptionAsync(
        string userId,
        ConfirmSubscriptionRequest request,
        CancellationToken ct = default)
    {
        var customerId = await EnsureStripeCustomerAsync(userId, ct);

        // Attach payment method - returns actual customer ID (may differ if PM was already attached)
        var actualCustomerId = await _stripeClient.AttachPaymentMethodAsync(customerId, request.PaymentMethodId, ct);

        // Select price based on interval
        var priceId = request.Interval switch
        {
            BillingInterval.Yearly => _stripeSettings.ProAnnualPriceId,
            _ => _stripeSettings.ProMonthlyPriceId
        };

        // Create subscription with the actual customer ID
        var subscription = await _stripeClient.CreateSubscriptionAsync(actualCustomerId, priceId, ct);

        _logger.LogInformation("Created subscription {SubscriptionId} for user {UserId}", subscription.Id, userId);

        return new SubscriptionResponse(subscription.Id, subscription.Status);
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
                false);
        }

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
                false);
        }

        var cancelAtPeriodEnd = false;

        if (!string.IsNullOrEmpty(subscription.StripeSubscriptionId))
        {
            var stripeSubscription = await _stripeClient.GetSubscriptionAsync(subscription.StripeSubscriptionId, ct);
            cancelAtPeriodEnd = stripeSubscription?.CancelAtPeriodEnd ?? false;
        }

        return new SubscriptionStatusDto(
            user.Plan,
            subscription.Status,
            subscription.CurrentPeriodEndUtc,
            cancelAtPeriodEnd);
    }

    public async Task<string> EnsureStripeCustomerAsync(string userId, CancellationToken ct = default)
    {
        var user = await _context.Users
            .OfType<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new InvalidOperationException($"User {userId} not found");

        // If user already has a Stripe customer ID, return it
        if (!string.IsNullOrEmpty(user.StripeCustomerId))
        {
            return user.StripeCustomerId;
        }

        // Create new Stripe customer and save to user
        var customer = await _stripeClient.CreateCustomerAsync(user.Email!, user.UserName, ct);
        user.StripeCustomerId = customer.Id;
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Created Stripe customer {CustomerId} for user {UserId}", customer.Id, userId);

        return customer.Id;
    }
}
