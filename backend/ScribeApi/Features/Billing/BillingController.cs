using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Features.Billing.Contracts;
using ScribeApi.Infrastructure.Billing;
using ScribeApi.Shared.Extensions;

namespace ScribeApi.Features.Billing;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BillingController : ControllerBase
{
    private readonly IBillingService _billingService;
    private readonly StripeSettings _stripeSettings;
    private readonly StripeWebhookHandler _webhookHandler;

    public BillingController(
        IBillingService billingService,
        IOptions<StripeSettings> stripeSettings,
        StripeWebhookHandler webhookHandler)
    {
        _billingService = billingService;
        _stripeSettings = stripeSettings.Value;
        _webhookHandler = webhookHandler;
    }

    // Create a SetupIntent for collecting payment method via Elements
    [HttpPost("setup-intent")]
    public async Task<ActionResult<SetupIntentResponse>> CreateSetupIntent(
        [FromBody] CreateSetupIntentRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _billingService.CreateSetupIntentAsync(userId, request, ct);
        return Ok(result);
    }

    // Confirm subscription after payment method collected
    [HttpPost("subscribe")]
    public async Task<ActionResult<SubscriptionResponse>> ConfirmSubscription(
        [FromBody] ConfirmSubscriptionRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _billingService.ConfirmSubscriptionAsync(userId, request, ct);
        return Ok(result);
    }

    // Create a billing portal session for subscription management
    [HttpPost("portal")]
    public async Task<ActionResult<PortalSessionResponse>> CreatePortalSession(
        [FromQuery] CreatePortalSessionRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _billingService.CreatePortalSessionAsync(userId, request.ReturnUrl, ct);
        return Ok(result);
    }

    // Get current subscription status
    [HttpGet("subscription")]
    public async Task<ActionResult<SubscriptionStatusDto>> GetSubscriptionStatus(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _billingService.GetSubscriptionStatusAsync(userId, ct);
        return Ok(result);
    }

    // Cancel user's subscription
    [HttpDelete("subscription")]
    public async Task<IActionResult> CancelSubscription(
        [FromQuery] bool cancelImmediately = false,
        CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var success = await _billingService.CancelSubscriptionAsync(userId, cancelImmediately, ct);
        if (!success) return NotFound("No active subscription found");

        return Ok(new { Message = cancelImmediately ? "Subscription cancelled immediately" : "Subscription will cancel at period end" });
    }

    // Change subscription plan (Monthly ↔ Annual)
    [HttpPut("subscription")]
    public async Task<ActionResult<SubscriptionResponse>> ChangeSubscriptionPlan(
        [FromBody] ChangeSubscriptionPlanRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _billingService.ChangeSubscriptionPlanAsync(userId, request.NewInterval, ct);
        return Ok(result);
    }

    // Get user's default payment method
    [HttpGet("payment-method")]
    public async Task<ActionResult<PaymentMethodResponse>> GetPaymentMethod(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _billingService.GetPaymentMethodAsync(userId, ct);
        if (result == null) return NotFound("No payment method found");

        return Ok(result);
    }

    // Get user's invoice history
    [HttpGet("invoices")]
    public async Task<ActionResult<InvoiceListResponse>> GetInvoices(
        [FromQuery] int limit = 10,
        [FromQuery] string? startingAfter = null,
        CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _billingService.GetInvoicesAsync(userId, limit, startingAfter, ct);
        return Ok(result);
    }

    // Get Stripe publishable key for frontend
    [HttpGet("config")]
    [AllowAnonymous]
    public ActionResult<StripePublicKeyResponse> GetConfig()
    {
        return Ok(new StripePublicKeyResponse(_stripeSettings.PublishableKey));
    }

    // Handle Stripe webhook events
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleWebhook(CancellationToken ct)
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync(ct);
        var signature = Request.Headers["Stripe-Signature"].FirstOrDefault();

        if (string.IsNullOrEmpty(signature))
        {
            return BadRequest("Missing Stripe-Signature header");
        }

        var stripeEvent = _webhookHandler.ConstructEvent(json, signature);
        if (stripeEvent == null)
        {
            return BadRequest("Invalid signature");
        }

        await _webhookHandler.HandleEventAsync(stripeEvent, ct);
        return Ok();
    }
}
