using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using Stripe;
using Stripe.Checkout;

namespace ScribeApi.Infrastructure.Billing;

public class StripeClient
{
    private readonly StripeSettings _settings;
    private readonly CustomerService _customerService;
    private readonly SessionService _sessionService;
    private readonly SubscriptionService _subscriptionService;

    public StripeClient(IOptions<StripeSettings> settings)
    {
        _settings = settings.Value;
        StripeConfiguration.ApiKey = _settings.SecretKey;

        _customerService = new CustomerService();
        _sessionService = new SessionService();
        _subscriptionService = new SubscriptionService();
    }

    // Create a new Stripe customer for a user
    public async Task<Customer> CreateCustomerAsync(string email, string? name, CancellationToken ct = default)
    {
        var options = new CustomerCreateOptions
        {
            Email = email,
            Name = name
        };

        return await _customerService.CreateAsync(options, cancellationToken: ct);
    }

    // Create a checkout session for upgrading to Pro plan
    public async Task<Session> CreateCheckoutSessionAsync(
        string customerId,
        string priceId,
        string? successUrl = null,
        string? cancelUrl = null,
        CancellationToken ct = default)
    {
        var options = new SessionCreateOptions
        {
            Customer = customerId,
            Mode = "subscription",
            LineItems = [new SessionLineItemOptions { Price = priceId, Quantity = 1 }],
            SuccessUrl = successUrl ?? _settings.SuccessUrl,
            CancelUrl = cancelUrl ?? _settings.CancelUrl
        };

        return await _sessionService.CreateAsync(options, cancellationToken: ct);
    }

    // Create a billing portal session for managing subscription
    public async Task<Stripe.BillingPortal.Session> CreatePortalSessionAsync(
        string customerId,
        string? returnUrl = null,
        CancellationToken ct = default)
    {
        var portalService = new Stripe.BillingPortal.SessionService();
        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = customerId,
            ReturnUrl = returnUrl ?? _settings.SuccessUrl
        };

        return await portalService.CreateAsync(options, cancellationToken: ct);
    }

    // Get subscription by ID from Stripe
    public async Task<Subscription?> GetSubscriptionAsync(string subscriptionId, CancellationToken ct = default)
    {
        try
        {
            return await _subscriptionService.GetAsync(subscriptionId, cancellationToken: ct);
        }
        catch (StripeException)
        {
            return null;
        }
    }

    // Cancel a subscription (at period end by default)
    public async Task<Subscription> CancelSubscriptionAsync(
        string subscriptionId,
        bool cancelImmediately = false,
        CancellationToken ct = default)
    {
        if (cancelImmediately)
        {
            return await _subscriptionService.CancelAsync(subscriptionId, cancellationToken: ct);
        }

        var options = new SubscriptionUpdateOptions { CancelAtPeriodEnd = true };
        return await _subscriptionService.UpdateAsync(subscriptionId, options, cancellationToken: ct);
    }

    // Get customer by ID from Stripe
    public async Task<Customer?> GetCustomerAsync(string customerId, CancellationToken ct = default)
    {
        try
        {
            return await _customerService.GetAsync(customerId, cancellationToken: ct);
        }
        catch (StripeException)
        {
            return null;
        }
    }
}