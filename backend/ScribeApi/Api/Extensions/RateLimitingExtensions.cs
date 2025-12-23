using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Domain.Plans;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Api.Extensions;

// Rate limiting service registration and middleware configuration
public static class RateLimitingExtensions
{
    public const string GlobalPolicy = "global";
    public const string AuthPolicy = "auth";
    public const string TranscriptionPolicy = "transcription";
    public const string UploadPolicy = "upload";

    public static IServiceCollection AddRateLimiting(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<RateLimitingSettings>(configuration.GetSection(RateLimitingSettings.SectionName));

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // Global rate limiter partitioned by user
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                var settings = context.RequestServices
                    .GetRequiredService<IOptions<RateLimitingSettings>>().Value;

                if (!settings.EnableRateLimiting)
                    return RateLimitPartition.GetNoLimiter(string.Empty);

                var (partitionKey, isPro) = GetPartitionInfo(context);
                var config = isPro ? settings.GlobalLimits.ProTier : settings.GlobalLimits.FreeTier;

                return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = config.PermitLimit,
                    Window = TimeSpan.FromSeconds(config.WindowSeconds),
                    QueueLimit = 0
                });
            });

            // Auth policy for login/register endpoints
            options.AddPolicy(AuthPolicy, context =>
            {
                var settings = context.RequestServices
                    .GetRequiredService<IOptions<RateLimitingSettings>>().Value;

                if (!settings.EnableRateLimiting)
                    return RateLimitPartition.GetNoLimiter(string.Empty);

                var (partitionKey, isPro) = GetPartitionInfo(context);
                var config = isPro ? settings.AuthLimits.ProTier : settings.AuthLimits.FreeTier;

                return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = config.PermitLimit,
                    Window = TimeSpan.FromSeconds(config.WindowSeconds),
                    QueueLimit = 0
                });
            });

            // Transcription policy for transcription creation
            options.AddPolicy(TranscriptionPolicy, context =>
            {
                var settings = context.RequestServices
                    .GetRequiredService<IOptions<RateLimitingSettings>>().Value;

                if (!settings.EnableRateLimiting)
                    return RateLimitPartition.GetNoLimiter(string.Empty);

                var (partitionKey, isPro) = GetPartitionInfo(context);
                var config = isPro ? settings.TranscriptionLimits.ProTier : settings.TranscriptionLimits.FreeTier;

                return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = config.PermitLimit,
                    Window = TimeSpan.FromSeconds(config.WindowSeconds),
                    QueueLimit = 0
                });
            });

            // Upload policy for file uploads
            options.AddPolicy(UploadPolicy, context =>
            {
                var settings = context.RequestServices
                    .GetRequiredService<IOptions<RateLimitingSettings>>().Value;

                if (!settings.EnableRateLimiting)
                    return RateLimitPartition.GetNoLimiter(string.Empty);

                var (partitionKey, isPro) = GetPartitionInfo(context);
                var config = isPro ? settings.UploadLimits.ProTier : settings.UploadLimits.FreeTier;

                return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = config.PermitLimit,
                    Window = TimeSpan.FromSeconds(config.WindowSeconds),
                    QueueLimit = 0
                });
            });

            // Custom response for rate limit exceeded
            options.OnRejected = async (context, cancellationToken) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.HttpContext.Response.ContentType = "application/json";

                var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfterValue)
                    ? retryAfterValue.TotalSeconds
                    : 60;

                context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter).ToString();

                await context.HttpContext.Response.WriteAsJsonAsync(new
                {
                    type = "https://tools.ietf.org/html/rfc6585#section-4",
                    title = "Too Many Requests",
                    status = 429,
                    detail = $"Rate limit exceeded. Try again in {retryAfter:0} seconds."
                }, cancellationToken);
            };
        });

        return services;
    }

    // Get partition key and subscription tier from request context
    private static (string PartitionKey, bool IsPro) GetPartitionInfo(HttpContext context)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isPro = context.User.HasClaim("plan", nameof(PlanType.Pro));

        // Authenticated users partition by user ID, anonymous by IP
        var partitionKey = userId ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous";

        return (partitionKey, isPro);
    }
}
