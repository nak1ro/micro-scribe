using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Interfaces;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.BackgroundJobs;

public class FileValidationJob
{
    private readonly AppDbContext _context;
    private readonly IFfmpegMediaService _ffmpegService;
    private readonly ILogger<FileValidationJob> _logger;

    public FileValidationJob(
        AppDbContext context,
        IFfmpegMediaService ffmpegService,
        ILogger<FileValidationJob> logger)
    {
        _context = context;
        _ffmpegService = ffmpegService;
        _logger = logger;
    }

    public async Task ValidateFileAsync(Guid sessionId, CancellationToken ct)
    {
        var session = await _context.UploadSessions.FindAsync([sessionId], ct);
        if (session == null)
        {
            _logger.LogWarning("UploadSession {SessionId} not found during validation.", sessionId);
            return;
        }

        if (session.Status != UploadSessionStatus.Uploaded)
        {
            // Already processed or not ready (or aborted)
            return;
        }

        session.Status = UploadSessionStatus.Validating;
        await _context.SaveChangesAsync(ct);

        try
        {
            // Probe file
            // Note: GetDurationAsync downloads the file to temp first.
            // This implicitly validates that the file exists and is readable by ffmpeg.
            var duration = await _ffmpegService.GetDurationAsync(session.StorageKey, ct);
            
            session.Status = UploadSessionStatus.Ready;
            session.ValidatedAtUtc = DateTime.UtcNow;
            session.DurationSeconds = duration.TotalSeconds;
            session.DetectedContainerType = Path.GetExtension(session.StorageKey).TrimStart('.').ToLowerInvariant();
            session.DetectedMediaType = MediaFileType.Audio; // Defaulting - can assume Audio for now
            
            _logger.LogInformation("UploadSession {SessionId} validated. Duration: {Duration}s", sessionId, session.DurationSeconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Validation failed for session {SessionId}", sessionId);
            session.Status = UploadSessionStatus.Invalid;
            session.ErrorMessage = $"Validation failed: {ex.Message}";
        }

        await _context.SaveChangesAsync(ct);
    }
}
