using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.BackgroundJobs;

public class WebhookDeliveryJob
{
    private readonly AppDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ILogger<WebhookDeliveryJob> _logger;

    private const int MaxAttempts = 5;
    private static readonly int[] RetryDelaysMinutes = [0, 1, 5, 30, 120];

    public WebhookDeliveryJob(
        AppDbContext context,
        HttpClient httpClient,
        IBackgroundJobClient backgroundJobClient,
        ILogger<WebhookDeliveryJob> logger)
    {
        _context = context;
        _httpClient = httpClient;
        _backgroundJobClient = backgroundJobClient;
        _logger = logger;
    }

    public async Task DeliverAsync(Guid deliveryId, CancellationToken ct)
    {
        var delivery = await _context.WebhookDeliveries
            .Include(d => d.Subscription)
            .FirstOrDefaultAsync(d => d.Id == deliveryId, ct);

        if (delivery == null)
        {
            _logger.LogWarning("Webhook delivery {DeliveryId} not found", deliveryId);
            return;
        }

        if (delivery.Status == WebhookDeliveryStatus.Sent)
        {
            _logger.LogDebug("Webhook delivery {DeliveryId} already sent", deliveryId);
            return;
        }

        delivery.Attempts++;
        delivery.LastAttemptAtUtc = DateTime.UtcNow;

        try
        {
            var signature = ComputeHmacSignature(delivery.Payload, delivery.Subscription.Secret);

            using var request = new HttpRequestMessage(HttpMethod.Post, delivery.Subscription.Url);
            request.Content = new StringContent(delivery.Payload, Encoding.UTF8, "application/json");
            request.Headers.Add("X-Webhook-Event", delivery.Event);
            request.Headers.Add("X-Webhook-Signature", $"sha256={signature}");
            request.Headers.Add("X-Webhook-Timestamp", DateTime.UtcNow.ToString("O"));
            request.Headers.Add("X-Webhook-Delivery-Id", delivery.Id.ToString());

            using var response = await _httpClient.SendAsync(request, ct);

            delivery.ResponseStatusCode = (int)response.StatusCode;

            if (response.IsSuccessStatusCode)
            {
                delivery.Status = WebhookDeliveryStatus.Sent;
                _logger.LogInformation("Webhook delivery {DeliveryId} sent successfully", deliveryId);
            }
            else
            {
                delivery.ResponseBody = await ReadResponseBodyAsync(response, ct);
                HandleRetry(delivery);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Webhook delivery {DeliveryId} failed with exception", deliveryId);
            delivery.ResponseBody = ex.Message;
            HandleRetry(delivery);
        }

        await _context.SaveChangesAsync(ct);
    }

    private void HandleRetry(WebhookDelivery delivery)
    {
        if (delivery.Attempts >= MaxAttempts)
        {
            delivery.Status = WebhookDeliveryStatus.Failed;
            _logger.LogWarning("Webhook delivery {DeliveryId} failed after {Attempts} attempts", delivery.Id, delivery.Attempts);
        }
        else
        {
            var delayMinutes = RetryDelaysMinutes[Math.Min(delivery.Attempts, RetryDelaysMinutes.Length - 1)];
            delivery.NextRetryAtUtc = DateTime.UtcNow.AddMinutes(delayMinutes);

            _backgroundJobClient.Schedule<WebhookDeliveryJob>(
                job => job.DeliverAsync(delivery.Id, CancellationToken.None),
                TimeSpan.FromMinutes(delayMinutes));

            _logger.LogInformation("Webhook delivery {DeliveryId} scheduled for retry in {Minutes} minutes", delivery.Id, delayMinutes);
        }
    }

    private static string ComputeHmacSignature(string payload, string secret)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secret);
        var payloadBytes = Encoding.UTF8.GetBytes(payload);

        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(payloadBytes);

        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static async Task<string?> ReadResponseBodyAsync(HttpResponseMessage response, CancellationToken ct)
    {
        try
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            return body.Length > 4000 ? body[..4000] : body;
        }
        catch
        {
            return null;
        }
    }
}
