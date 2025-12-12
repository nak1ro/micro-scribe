using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Exceptions;
using ScribeApi.Features.Webhooks.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Shared.Extensions;

namespace ScribeApi.Features.Webhooks;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WebhooksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public WebhooksController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpPost]
    public async Task<ActionResult<WebhookSubscriptionDto>> CreateSubscription(
        [FromBody] CreateWebhookRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var subscription = new WebhookSubscription
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            User = null!,
            Url = request.Url,
            Secret = request.Secret,
            Events = request.Events,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.WebhookSubscriptions.Add(subscription);
        await _context.SaveChangesAsync(ct);

        return CreatedAtAction(
            nameof(GetSubscription),
            new { id = subscription.Id },
            _mapper.Map<WebhookSubscriptionDto>(subscription));
    }

    [HttpGet]
    public async Task<ActionResult<List<WebhookSubscriptionDto>>> ListSubscriptions(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var subscriptions = await _context.WebhookSubscriptions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAtUtc)
            .ToListAsync(ct);

        return Ok(_mapper.Map<List<WebhookSubscriptionDto>>(subscriptions));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WebhookSubscriptionDto>> GetSubscription(Guid id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var subscription = await _context.WebhookSubscriptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId, ct);

        if (subscription == null) return NotFound();

        return Ok(_mapper.Map<WebhookSubscriptionDto>(subscription));
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<WebhookSubscriptionDto>> UpdateSubscription(
        Guid id,
        [FromBody] UpdateWebhookRequest request,
        CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var subscription = await _context.WebhookSubscriptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId, ct);

        if (subscription == null) return NotFound();

        if (request.Url != null) subscription.Url = request.Url;
        if (request.Secret != null) subscription.Secret = request.Secret;
        if (request.Events != null) subscription.Events = request.Events;
        if (request.IsActive.HasValue) subscription.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(ct);

        return Ok(_mapper.Map<WebhookSubscriptionDto>(subscription));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSubscription(Guid id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var subscription = await _context.WebhookSubscriptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId, ct);

        if (subscription == null) return NotFound();

        _context.WebhookSubscriptions.Remove(subscription);
        await _context.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpGet("{id:guid}/deliveries")]
    public async Task<ActionResult<List<WebhookDeliveryDto>>> GetDeliveries(
        Guid id,
        [FromQuery] int limit = 50,
        CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var subscription = await _context.WebhookSubscriptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId, ct);

        if (subscription == null) return NotFound();

        var deliveries = await _context.WebhookDeliveries
            .Where(d => d.SubscriptionId == id)
            .OrderByDescending(d => d.CreatedAtUtc)
            .Take(limit)
            .ToListAsync(ct);

        return Ok(_mapper.Map<List<WebhookDeliveryDto>>(deliveries));
    }
}
