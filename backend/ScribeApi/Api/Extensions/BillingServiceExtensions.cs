using ScribeApi.Core.Configuration;
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

        // Register memory cache for webhook idempotency
        services.AddMemoryCache();

        // Register services
        services.AddScoped<StripeClient>();
        services.AddScoped<StripeWebhookHandler>();
        services.AddScoped<IBillingService, BillingService>();

        return services;
    }
}
