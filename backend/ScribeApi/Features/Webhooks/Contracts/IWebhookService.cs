namespace ScribeApi.Features.Webhooks.Contracts;

public interface IWebhookService
{
    Task EnqueueAsync(string userId, string eventName, object payload, CancellationToken ct);
}
