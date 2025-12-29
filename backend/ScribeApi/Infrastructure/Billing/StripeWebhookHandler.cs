using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Billing;

// Handles incoming Stripe webhook events
public class StripeWebhookHandler
{
    private readonly AppDbContext _context;
    private readonly StripeSettings _settings;
    private readonly StripeClient _stripeClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<StripeWebhookHandler> _logger;

    public StripeWebhookHandler(
        AppDbContext context,
        IOptions<StripeSettings> settings,
        StripeClient stripeClient,
        IMemoryCache cache,
        ILogger<StripeWebhookHandler> logger)
    {
        _context = context;
        _settings = settings.Value;
        _stripeClient = stripeClient;
        _cache = cache;
        _logger = logger;
    }

    // Verify webhook signature and parse event
    public Stripe.Event? ConstructEvent(string json, string signature)
    {
        try
        {
            return Stripe.EventUtility.ConstructEvent(json, signature, _settings.WebhookSecret);
        }
        catch (Stripe.StripeException ex)
        {
            _logger.LogWarning(ex, "Failed to verify webhook signature");
            return null;
        }
    }

    // Handle a Stripe webhook event (with idempotency check)
    public async Task HandleEventAsync(Stripe.Event stripeEvent, CancellationToken ct = default)
    {
        var cacheKey = $"stripe_event:{stripeEvent.Id}";
        if (_cache.TryGetValue(cacheKey, out _))
        {
            _logger.LogDebug("Skipping duplicate event {EventId}", stripeEvent.Id);
            return;
        }

        _cache.Set(cacheKey, true, TimeSpan.FromHours(24));
        _logger.LogInformation("Handling Stripe event {EventType} ({EventId})", stripeEvent.Type, stripeEvent.Id);

        switch (stripeEvent.Type)
        {
            case "customer.subscription.created":
            case "customer.subscription.updated":
                await HandleSubscriptionUpdatedAsync(stripeEvent, ct);
                break;
            case "customer.subscription.deleted":
                await HandleSubscriptionDeletedAsync(stripeEvent, ct);
                break;
            case "invoice.paid":
                await HandleInvoicePaidAsync(stripeEvent, ct);
                break;
            case "invoice.payment_failed":
                await HandleInvoicePaymentFailedAsync(stripeEvent, ct);
                break;
            default:
                _logger.LogDebug("Unhandled event type: {EventType}", stripeEvent.Type);
                break;
        }
    }

    private async Task HandleSubscriptionUpdatedAsync(Stripe.Event stripeEvent, CancellationToken ct)
    {
        if (stripeEvent.Data.Object is not Stripe.Subscription eventSub) return;

        // Fetch latest subscription from Stripe to ensure fresh state (events can arrive out of order)
        var stripeSub = await _stripeClient.GetSubscriptionAsync(eventSub.Id, ct) ?? eventSub;

        var user = await FindUserByCustomerIdAsync(stripeSub.CustomerId, ct);
        if (user == null) return;

        var localSub = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSub.Id, ct);

        if (localSub == null)
        {
            localSub = new Subscription
            {
                UserId = user.Id,
                StripeCustomerId = stripeSub.CustomerId,
                StripeSubscriptionId = stripeSub.Id,
                User = user
            };
            _context.Subscriptions.Add(localSub);
        }

        localSub.Status = MapStripeStatus(stripeSub.Status);
        var firstItem = stripeSub.Items.Data.FirstOrDefault();
        if (firstItem != null)
        {
            localSub.CurrentPeriodStartUtc = firstItem.CurrentPeriodStart;
            localSub.CurrentPeriodEndUtc = firstItem.CurrentPeriodEnd;
        }

        user.Plan = localSub.Status == SubscriptionStatus.Active ? PlanType.Pro : PlanType.Free;

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Subscription {SubscriptionId} updated for user {UserId}", stripeSub.Id, user.Id);
    }

    private async Task HandleSubscriptionDeletedAsync(Stripe.Event stripeEvent, CancellationToken ct)
    {
        Stripe.Subscription? stripeSub = stripeEvent.Data.Object as Stripe.Subscription;
        if (stripeSub == null) return;

        var user = await FindUserByCustomerIdAsync(stripeSub.CustomerId, ct);
        if (user == null) return;

        var localSub = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSub.Id, ct);

        if (localSub != null)
        {
            localSub.Status = SubscriptionStatus.Canceled;
            localSub.CanceledAtUtc = DateTime.UtcNow;
        }

        user.Plan = PlanType.Free;
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Subscription deleted, user {UserId} downgraded to Free", user.Id);
    }

    private async Task HandleInvoicePaidAsync(Stripe.Event stripeEvent, CancellationToken ct)
    {
        var invoice = stripeEvent.Data.Object as Stripe.Invoice;
        if (invoice == null) return;

        _logger.LogInformation("Invoice {InvoiceId} paid for customer {CustomerId}", invoice.Id, invoice.CustomerId);

        // Find user and update their subscription/plan
        var user = await FindUserByCustomerIdAsync(invoice.CustomerId, ct);
        if (user == null) return;

        var localSub = await _context.Subscriptions
            .Where(s => s.UserId == user.Id)
            .OrderByDescending(s => s.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        if (localSub != null)
        {
            localSub.Status = SubscriptionStatus.Active;
            
            // Update period dates from invoice
            localSub.CurrentPeriodStartUtc = invoice.PeriodStart;
            localSub.CurrentPeriodEndUtc = invoice.PeriodEnd;

            user.Plan = PlanType.Pro;
            await _context.SaveChangesAsync(ct);
            
            _logger.LogInformation("Invoice paid - user {UserId} upgraded to Pro, period: {Start} to {End}", 
                user.Id, localSub.CurrentPeriodStartUtc, localSub.CurrentPeriodEndUtc);
        }
    }

    private async Task HandleInvoicePaymentFailedAsync(Stripe.Event stripeEvent, CancellationToken ct)
    {
        var invoice = stripeEvent.Data.Object as Stripe.Invoice;
        if (invoice == null) return;

        _logger.LogWarning("Invoice {InvoiceId} payment failed for customer {CustomerId}", invoice.Id, invoice.CustomerId);

        var user = await FindUserByCustomerIdAsync(invoice.CustomerId, ct);
        if (user == null) return;

        var localSub = await _context.Subscriptions
            .Where(s => s.UserId == user.Id)
            .OrderByDescending(s => s.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        if (localSub != null)
        {
            // Cancel subscription immediately on payment failure
            localSub.Status = SubscriptionStatus.Canceled;
            localSub.CanceledAtUtc = DateTime.UtcNow;
            user.Plan = PlanType.Free;
            await _context.SaveChangesAsync(ct);

            // Cancel in Stripe as well
            if (!string.IsNullOrEmpty(localSub.StripeSubscriptionId))
            {
                await _stripeClient.CancelSubscriptionAsync(localSub.StripeSubscriptionId, true, ct);
            }

            _logger.LogInformation("Payment failed - user {UserId} downgraded to Free, subscription cancelled", user.Id);
        }
    }

    // Find user by Stripe customer ID (checks ApplicationUser first, then Subscriptions for backward compatibility)
    private async Task<ApplicationUser?> FindUserByCustomerIdAsync(string customerId, CancellationToken ct)
    {
        // First, check ApplicationUser.StripeCustomerId (primary source)
        var user = await _context.Users
            .OfType<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.StripeCustomerId == customerId, ct);

        if (user != null)
        {
            return user;
        }

        // Fallback: check Subscriptions table (for backward compatibility)
        var subscription = await _context.Subscriptions
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.StripeCustomerId == customerId, ct);

        if (subscription?.User != null)
        {
            return subscription.User;
        }

        _logger.LogWarning("No user found for Stripe customer {CustomerId}", customerId);
        return null;
    }

    private static SubscriptionStatus MapStripeStatus(string status)
    {
        return status switch
        {
            "active" => SubscriptionStatus.Active,
            "canceled" => SubscriptionStatus.Canceled,
            "past_due" => SubscriptionStatus.PastDue,
            "incomplete" => SubscriptionStatus.Incomplete,
            "incomplete_expired" => SubscriptionStatus.IncompleteExpired,
            "trialing" => SubscriptionStatus.Trialing,
            _ => SubscriptionStatus.Active
        };
    }
}
