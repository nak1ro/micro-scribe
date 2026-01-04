using Microsoft.EntityFrameworkCore;
using ScribeApi.Infrastructure.Persistence;

namespace ScribeApi.Infrastructure.BackgroundJobs;

// Cleans up old processed Stripe event records to prevent table bloat
public class CleanupProcessedEventsJob
{
    private readonly AppDbContext _context;
    private readonly ILogger<CleanupProcessedEventsJob> _logger;

    public CleanupProcessedEventsJob(AppDbContext context, ILogger<CleanupProcessedEventsJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    // Deletes events older than 7 days
    public async Task RunAsync(CancellationToken ct = default)
    {
        var cutoff = DateTime.UtcNow.AddDays(-7);
        
        var deleted = await _context.ProcessedStripeEvents
            .Where(e => e.ProcessedAtUtc < cutoff)
            .ExecuteDeleteAsync(ct);

        if (deleted > 0)
        {
            _logger.LogInformation("Cleaned up {Count} old processed Stripe events", deleted);
        }
    }
}
