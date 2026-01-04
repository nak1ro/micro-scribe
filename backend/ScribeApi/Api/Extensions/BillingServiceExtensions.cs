using ScribeApi.Core.Configuration;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Billing.Contracts;
using ScribeApi.Features.Billing.Services;
using ScribeApi.Infrastructure.Billing;

namespace ScribeApi.Api.Extensions;

// DI registration for billing services
public static class BillingServiceExtensions
{
    public static IServiceCollection AddBilling(this IServiceCollection services, IConfiguration configuration)
    {
        // Register configuration
        services.Configure<StripeSettings>(configuration.GetSection(StripeSettings.SectionName));

        // Register services
        services.AddScoped<StripeClient>();
        services.AddScoped<StripeWebhookHandler>();
        services.AddScoped<IBillingService, BillingService>();
        services.AddScoped<IWebhookIdempotencyService, WebhookIdempotencyService>();

        return services;
    }
}

