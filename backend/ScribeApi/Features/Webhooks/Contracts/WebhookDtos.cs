using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Webhooks.Contracts;

// Create subscription request
public record CreateWebhookRequest(
    string Url,
    string Secret,
    List<string> Events
);

// Update subscription request
public record UpdateWebhookRequest(
    string? Url,
    string? Secret,
    List<string>? Events,
    bool? IsActive
);

// Subscription response
public record WebhookSubscriptionDto(
    Guid Id,
    string Url,
    List<string> Events,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? LastTriggeredAtUtc
);

// Delivery history response
public record WebhookDeliveryDto(
    Guid Id,
    string Event,
    WebhookDeliveryStatus Status,
    int Attempts,
    int? ResponseStatusCode,
    DateTime CreatedAtUtc,
    DateTime? LastAttemptAtUtc
);

// Webhook payload wrapper
public record WebhookPayload(
    string Event,
    DateTime Timestamp,
    object Data
);

// Supported events
public static class WebhookEvents
{
    public const string JobCompleted = "job.completed";
    public const string JobFailed = "job.failed";
    public const string JobCancelled = "job.cancelled";

    public static readonly string[] All = [JobCompleted, JobFailed, JobCancelled];
}
