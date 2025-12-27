namespace ScribeApi.Core.Configuration;

// Configuration for Stripe payment integration
public class StripeSettings
{
    public const string SectionName = "Stripe";

    // Stripe secret API key (sk_test_xxx or sk_live_xxx)
    public string SecretKey { get; set; } = string.Empty;

    // Stripe publishable API key (pk_test_xxx or pk_live_xxx)
    public string PublishableKey { get; set; } = string.Empty;

    // Webhook signing secret for verifying webhook signatures (whsec_xxx)
    public string WebhookSecret { get; set; } = string.Empty;

    // Price ID for Pro plan from Stripe Dashboard (price_xxx)
    public string ProPriceId { get; set; } = string.Empty;

    // URL to redirect to after successful checkout
    public string SuccessUrl { get; set; } = string.Empty;

    // URL to redirect to if user cancels checkout
    public string CancelUrl { get; set; } = string.Empty;
}
