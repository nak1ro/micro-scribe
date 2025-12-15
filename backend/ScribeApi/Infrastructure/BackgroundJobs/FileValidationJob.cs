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

        // Atomic State Transition: Uploaded -> Validating
        // Prevents multiple jobs from validating the same file
        var rowsAffected = await _context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE \"UploadSessions\" SET \"Status\" = {(int)UploadSessionStatus.Validating} WHERE \"Id\" = {sessionId} AND \"Status\" = {(int)UploadSessionStatus.Uploaded}", 
            ct);

        if (rowsAffected == 0)
        {
            _logger.LogWarning("FileValidationJob: Session {SessionId} not in Uploaded state (or already validating).", sessionId);
            return;
        }

        // Reload to get fresh data now that we own the lock
        await _context.Entry(session).ReloadAsync(ct);

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
