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

        // Generate idempotency key to prevent duplicate subscriptions
        var idempotencyKey = $"sub_{userId}_{DateTime.UtcNow:yyyyMMddHHmm}";

        // Create subscription with the actual customer ID
        var subscription = await _stripeClient.CreateSubscriptionAsync(actualCustomerId, priceId, idempotencyKey, ct);

        _logger.LogInformation("Created subscription {SubscriptionId} for user {UserId}", subscription.Id, userId);

        return new SubscriptionResponse(subscription.Id, subscription.Status);
    }

    public async Task<PortalSessionResponse> CreatePortalSessionAsync(
        string userId,
        string? returnUrl = null,
        CancellationToken ct = default)
    {
        var customerId = await EnsureStripeCustomerAsync(userId, ct);
        
        // Stripe requires absolute URL, fallback to SuccessUrl from settings
        var effectiveReturnUrl = string.IsNullOrEmpty(returnUrl) ? _stripeSettings.SuccessUrl : returnUrl;
        var session = await _stripeClient.CreatePortalSessionAsync(customerId, effectiveReturnUrl, ct);

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
                null);
        }

        var cancelAtPeriodEnd = false;

        BillingInterval? interval = null;
        if (!string.IsNullOrEmpty(subscription.StripeSubscriptionId))
        {
            var stripeSubscription = await _stripeClient.GetSubscriptionAsync(subscription.StripeSubscriptionId, ct);
            if (stripeSubscription != null)
            {
                cancelAtPeriodEnd = stripeSubscription.CancelAtPeriodEnd;
                if (stripeSubscription.Items.Data.FirstOrDefault()?.Price?.Recurring?.Interval is string intervalStr)
                {
                    interval = intervalStr.ToLower() switch
                    {
                        "year" => BillingInterval.Yearly,
                        "month" => BillingInterval.Monthly,
                        _ => null
                    };
                }
            }
        }

        return new SubscriptionStatusDto(
            user.Plan,
            subscription.Status,
            subscription.CurrentPeriodEndUtc,
            cancelAtPeriodEnd,
            interval);
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

    public async Task<bool> CancelSubscriptionAsync(string userId, bool cancelImmediately = false, CancellationToken ct = default)
    {
        var subscription = await _context.Subscriptions
            .Where(s => s.UserId == userId && s.Status == SubscriptionStatus.Active)
            .OrderByDescending(s => s.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        if (subscription == null || string.IsNullOrEmpty(subscription.StripeSubscriptionId))
        {
            _logger.LogWarning("No active subscription found for user {UserId}", userId);
            return false;
        }

        await _stripeClient.CancelSubscriptionAsync(subscription.StripeSubscriptionId, cancelImmediately, ct);

        if (cancelImmediately)
        {
            subscription.Status = SubscriptionStatus.Canceled;
            subscription.CanceledAtUtc = DateTime.UtcNow;

            var user = await _context.Users.OfType<ApplicationUser>().FirstOrDefaultAsync(u => u.Id == userId, ct);
            if (user != null) user.Plan = PlanType.Free;
        }

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Cancelled subscription {SubscriptionId} for user {UserId}, immediate: {Immediate}", 
            subscription.StripeSubscriptionId, userId, cancelImmediately);

        return true;
    }

    public async Task<SubscriptionResponse> ChangeSubscriptionPlanAsync(
        string userId,
        BillingInterval newInterval,
        CancellationToken ct = default)
    {
        var subscription = await _context.Subscriptions
            .Where(s => s.UserId == userId && s.Status == SubscriptionStatus.Active)
            .OrderByDescending(s => s.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        if (subscription == null || string.IsNullOrEmpty(subscription.StripeSubscriptionId))
            throw new InvalidOperationException("No active subscription found");

        var newPriceId = newInterval switch
        {
            BillingInterval.Yearly => _stripeSettings.ProAnnualPriceId,
            _ => _stripeSettings.ProMonthlyPriceId
        };

        var updated = await _stripeClient.UpdateSubscriptionPriceAsync(
            subscription.StripeSubscriptionId, newPriceId, ct);

        _logger.LogInformation("Changed subscription {SubscriptionId} to {Interval} for user {UserId}",
            subscription.StripeSubscriptionId, newInterval, userId);

        return new SubscriptionResponse(updated.Id, updated.Status);
    }

    public async Task<PaymentMethodResponse?> GetPaymentMethodAsync(string userId, CancellationToken ct = default)
    {
        var user = await _context.Users.OfType<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (string.IsNullOrEmpty(user?.StripeCustomerId)) return null;

        var paymentMethod = await _stripeClient.GetDefaultPaymentMethodAsync(user.StripeCustomerId, ct);
        if (paymentMethod?.Card == null) return null;

        return new PaymentMethodResponse(
            paymentMethod.Card.Brand,
            paymentMethod.Card.Last4,
            (int)paymentMethod.Card.ExpMonth,
            (int)paymentMethod.Card.ExpYear);
    }

    public async Task<InvoiceListResponse> GetInvoicesAsync(
        string userId,
        int limit = 10,
        string? startingAfter = null,
        CancellationToken ct = default)
    {
        var user = await _context.Users.OfType<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (string.IsNullOrEmpty(user?.StripeCustomerId))
            return new InvoiceListResponse([], false, null);

        var invoices = await _stripeClient.ListInvoicesAsync(user.StripeCustomerId, limit, startingAfter, ct);

        var items = invoices.Data.Select(inv => new InvoiceItem(
            inv.Id,
            inv.Created,
            inv.AmountPaid,
            inv.Currency,
            inv.Status,
            inv.InvoicePdf)).ToList();

        return new InvoiceListResponse(items, invoices.HasMore, items.LastOrDefault()?.Id);
    }
}
