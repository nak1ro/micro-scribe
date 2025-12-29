using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using Stripe;
using Stripe.BillingPortal;

namespace ScribeApi.Infrastructure.Billing;

public class StripeClient
{
    private readonly StripeSettings _settings;
    private readonly CustomerService _customerService;
    private readonly SetupIntentService _setupIntentService;
    private readonly SubscriptionService _subscriptionService;
    private readonly PaymentMethodService _paymentMethodService;

    public StripeClient(IOptions<StripeSettings> settings)
    {
        _settings = settings.Value;
        StripeConfiguration.ApiKey = _settings.SecretKey;

        _customerService = new CustomerService();
        _setupIntentService = new SetupIntentService();
        _subscriptionService = new SubscriptionService();
        _paymentMethodService = new PaymentMethodService();
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

    // Create a SetupIntent for collecting payment method via Elements
    public async Task<SetupIntent> CreateSetupIntentAsync(string customerId, CancellationToken ct = default)
    {
        var options = new SetupIntentCreateOptions
        {
            Customer = customerId,
            PaymentMethodTypes = ["card"],
            Usage = "off_session"
        };

        return await _setupIntentService.CreateAsync(options, cancellationToken: ct);
    }

    // Attach a payment method to a customer and set as default. Returns the actual customer ID.
    public async Task<string> AttachPaymentMethodAsync(string customerId, string paymentMethodId, CancellationToken ct = default)
    {
        // Check if payment method is already attached to a customer
        var paymentMethod = await _paymentMethodService.GetAsync(paymentMethodId, cancellationToken: ct);
        var actualCustomerId = customerId;

        if (paymentMethod.Customer != null)
        {
            // Payment method is already attached - use that customer
            actualCustomerId = paymentMethod.Customer.Id;
        }
        else
        {
            // Attach to the provided customer
            await _paymentMethodService.AttachAsync(paymentMethodId, new PaymentMethodAttachOptions
            {
                Customer = customerId
            }, cancellationToken: ct);
        }

        // Set as default payment method
        await _customerService.UpdateAsync(actualCustomerId, new CustomerUpdateOptions
        {
            InvoiceSettings = new CustomerInvoiceSettingsOptions
            {
                DefaultPaymentMethod = paymentMethodId
            }
        }, cancellationToken: ct);

        return actualCustomerId;
    }

    // Create a subscription for a customer with a specific price
    public async Task<Subscription> CreateSubscriptionAsync(
        string customerId,
        string priceId,
        CancellationToken ct = default)
    {
        var options = new SubscriptionCreateOptions
        {
            Customer = customerId,
            Items = [new SubscriptionItemOptions { Price = priceId }],
            PaymentBehavior = "default_incomplete",
            PaymentSettings = new SubscriptionPaymentSettingsOptions
            {
                SaveDefaultPaymentMethod = "on_subscription"
            },
            Expand = ["latest_invoice.payment_intent"]
        };

        return await _subscriptionService.CreateAsync(options, cancellationToken: ct);
    }

    // Create a billing portal session for managing subscription
    public async Task<Session> CreatePortalSessionAsync(
        string customerId,
        string? returnUrl = null,
        CancellationToken ct = default)
    {
        var portalService = new SessionService();
        var options = new SessionCreateOptions
        {
            Customer = customerId,
            ReturnUrl = returnUrl ?? "/"
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