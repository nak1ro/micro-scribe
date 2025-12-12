using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Interfaces;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.BackgroundJobs;

public class CleanupStaleUploadsJob
{
    private readonly AppDbContext _context;
    private readonly IFileStorageService _storage;
    private readonly ILogger<CleanupStaleUploadsJob> _logger;

    public CleanupStaleUploadsJob(
        AppDbContext context,
        IFileStorageService storage,
        ILogger<CleanupStaleUploadsJob> logger)
    {
        _context = context;
        _storage = storage;
        _logger = logger;
    }

    public async Task RunAsync(CancellationToken ct)
    {
        var cutoff = DateTime.UtcNow.AddHours(-24);
        var staleSessions = await _context.UploadSessions
            .Where(s => (s.Status == UploadSessionStatus.Created || s.Status == UploadSessionStatus.Uploading) 
                        && s.CreatedAtUtc < cutoff)
            .Take(50) // Batch processing
            .ToListAsync(ct);

        if (staleSessions.Count == 0) return;

        _logger.LogInformation("Found {Count} stale upload sessions to clean up", staleSessions.Count);

        foreach (var session in staleSessions)
        {
            try
            {
                if (!string.IsNullOrEmpty(session.UploadId))
                {
                    await _storage.AbortMultipartUploadAsync(session.StorageKey, session.UploadId, ct);
                    _logger.LogInformation("Aborted multipart upload for session {SessionId}", session.Id);
                }
                else
                {
                    // Case for single PUT uploads that might be lurking or partial
                    await _storage.DeleteAsync(session.StorageKey, ct);
                }
                
                session.Status = UploadSessionStatus.Aborted;
                session.DeletedAtUtc = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to cleanup stale session {SessionId}", session.Id);
            }
        }

        await _context.SaveChangesAsync(ct);
    }
}
