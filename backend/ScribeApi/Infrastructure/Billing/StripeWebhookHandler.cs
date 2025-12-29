using Microsoft.EntityFrameworkCore;
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
    private readonly ILogger<StripeWebhookHandler> _logger;

    public StripeWebhookHandler(
        AppDbContext context,
        IOptions<StripeSettings> settings,
        ILogger<StripeWebhookHandler> logger)
    {
        _context = context;
        _settings = settings.Value;
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

    // Handle a Stripe webhook event
    public async Task HandleEventAsync(Stripe.Event stripeEvent, CancellationToken ct = default)
    {
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
        if (stripeEvent.Data.Object is not Stripe.Subscription stripeSub) return;

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

    private Task HandleInvoicePaidAsync(Stripe.Event stripeEvent, CancellationToken ct)
    {
        var invoice = stripeEvent.Data.Object as Stripe.Invoice;
        if (invoice == null) return Task.CompletedTask;

        _logger.LogInformation("Invoice {InvoiceId} paid for customer {CustomerId}", invoice.Id, invoice.CustomerId);
        return Task.CompletedTask;
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
            localSub.Status = SubscriptionStatus.PastDue;
            await _context.SaveChangesAsync(ct);
        }
    }

    // Find user by Stripe customer ID via the Subscription entity
    private async Task<ApplicationUser?> FindUserByCustomerIdAsync(string customerId, CancellationToken ct)
    {
        var subscription = await _context.Subscriptions
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.StripeCustomerId == customerId, ct);

        if (subscription?.User == null)
        {
            _logger.LogWarning("No user found for Stripe customer {CustomerId}", customerId);
            return null;
        }

        return subscription.User;
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
