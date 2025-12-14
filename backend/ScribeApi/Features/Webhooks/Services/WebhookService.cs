using System.Text.Json;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Features.Webhooks.Contracts;
using ScribeApi.Infrastructure.BackgroundJobs;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Webhooks.Services;

public class WebhookService : IWebhookService
{
    private readonly AppDbContext _context;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ILogger<WebhookService> _logger;

    public WebhookService(
        AppDbContext context,
        IBackgroundJobClient backgroundJobClient,
        ILogger<WebhookService> logger)
    {
        _context = context;
        _backgroundJobClient = backgroundJobClient;
        _logger = logger;
    }

    public async Task EnqueueAsync(string userId, string eventName, object payload, CancellationToken ct)
    {
        // Fetch active subscriptions first, then filter by event in-memory
        // EF Core can't translate Contains on List<string> stored as JSON
        var activeSubscriptions = await _context.WebhookSubscriptions
            .Where(s => s.UserId == userId && s.IsActive)
            .ToListAsync(ct);

        var subscriptions = activeSubscriptions
            .Where(s => s.Events.Contains(eventName))
            .ToList();

        if (subscriptions.Count == 0)
        {
            _logger.LogDebug("No active webhook subscriptions for user {UserId} and event {Event}", userId, eventName);
            return;
        }

        var webhookPayload = new WebhookPayload(eventName, DateTime.UtcNow, payload);
        var payloadJson = JsonSerializer.Serialize(webhookPayload);

        foreach (var subscription in subscriptions)
        {
            var delivery = new WebhookDelivery
            {
                Id = Guid.NewGuid(),
                SubscriptionId = subscription.Id,
                Subscription = subscription,
                Event = eventName,
                Payload = payloadJson,
                Status = WebhookDeliveryStatus.Pending,
                Attempts = 0,
                CreatedAtUtc = DateTime.UtcNow
            };

            _context.WebhookDeliveries.Add(delivery);
            await _context.SaveChangesAsync(ct);

            subscription.LastTriggeredAtUtc = DateTime.UtcNow;

            _backgroundJobClient.Enqueue<WebhookDeliveryJob>(job => job.DeliverAsync(delivery.Id, CancellationToken.None));

            _logger.LogInformation("Enqueued webhook delivery {DeliveryId} for subscription {SubscriptionId}", delivery.Id, subscription.Id);
        }
    }
}
