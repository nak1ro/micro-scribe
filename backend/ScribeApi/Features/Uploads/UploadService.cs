using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ScribeApi.Common.Configuration.Plans;
using ScribeApi.Common.Interfaces;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Infrastructure.Storage;

namespace ScribeApi.Features.Uploads;

public class UploadService : IUploadService
{
    private readonly AppDbContext _context;
    private readonly IFileStorageService _storageService;
    private readonly PlansOptions _plansOptions;
    private readonly ILogger<UploadService> _logger;

    public UploadService(
        AppDbContext context,
        IFileStorageService storageService,
        IOptions<PlansOptions> plansOptions,
        ILogger<UploadService> logger)
    {
        _context = context;
        _storageService = storageService;
        _plansOptions = plansOptions.Value;
        _logger = logger;
    }

    public async Task<UploadSession> CreateSessionAsync(string userId, InitUploadRequest request, CancellationToken ct)
    {
        var userPlan = await GetUserPlanDefinitionAsync(userId, ct);

        // Validate File Size (User reported)
        if (request.TotalSizeBytes > userPlan.MaxFileSizeBytes)
        {
            throw new ArgumentException($"File size exceeds the limit of {userPlan.MaxFileSizeBytes / 1024 / 1024} MB for your plan.");
        }

        // Validate Active Sessions Limit (MaxFilesPerUpload)
        var activeSessionsCount = await _context.UploadSessions
            .CountAsync(s => s.UserId == userId && s.Status == UploadSessionStatus.Active, ct);

        if (activeSessionsCount >= userPlan.MaxFilesPerUpload)
        {
            throw new InvalidOperationException($"You have reached the maximum number of active uploads ({userPlan.MaxFilesPerUpload}) for your plan.");
        }

        // Create Session
        var session = new UploadSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            User = null!, // EF Core will handle this if UserId is set, or we load it if needed. Setting null! to satisfy required.
            OriginalFileName = request.FileName,
            ContentType = request.ContentType,
            TotalSizeBytes = request.TotalSizeBytes,
            TotalChunks = 1, // Assuming single file upload for now
            ReceivedChunksCount = 0,
            StorageKeyPrefix = $"uploads/{userId}/{Guid.NewGuid()}",
            Status = UploadSessionStatus.Active,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(24)
        };

        _context.UploadSessions.Add(session);
        await _context.SaveChangesAsync(ct);

        return session;
    }

    public async Task<MediaFile> UploadFileAsync(Guid sessionId, Stream fileStream, string userId, CancellationToken ct)
    {
        var session = await _context.UploadSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);

        if (session == null)
        {
            throw new KeyNotFoundException("Upload session not found or does not belong to user.");
        }

        if (session.Status != UploadSessionStatus.Active)
        {
            throw new InvalidOperationException($"Session is not active. Current status: {session.Status}");
        }

        // Prevent session reuse
        if (session.MediaFileId.HasValue)
        {
            throw new InvalidOperationException("This upload session has already been completed.");
        }

        // Check for expiration
        if (session.ExpiresAtUtc < DateTime.UtcNow)
        {
            session.Status = UploadSessionStatus.Expired;
            await _context.SaveChangesAsync(ct);
            throw new TimeoutException($"Upload session expired at {session.ExpiresAtUtc} UTC.");
        }
        
        var userPlan = await GetUserPlanDefinitionAsync(userId, ct);

        // Validate Real File Size against Plan Limit
        if (fileStream.Length > userPlan.MaxFileSizeBytes)
        {
            throw new ArgumentException($"Actual file size ({fileStream.Length} bytes) exceeds the limit of {userPlan.MaxFileSizeBytes} bytes for your plan.");
        }

        // Validate consistency with declared size (warn/reject if > 10% mismatch)
        if (session.TotalSizeBytes.HasValue)
        {
            var difference = Math.Abs(fileStream.Length - session.TotalSizeBytes.Value);
            var percentDiff = (double)difference / session.TotalSizeBytes.Value;
            
            if (percentDiff > 0.10)
            {
                 _logger.LogWarning("File size mismatch. Declared: {Declared}, Actual: {Actual}", session.TotalSizeBytes, fileStream.Length);
                 throw new ArgumentException("Uploaded file size differs significantly from the declared size.");
            }
        }

        try
        {
            // Save File
            // Using StorageKeyPrefix as the folder/path structure
            var savedPath = await _storageService.SaveAsync(fileStream, $"{session.StorageKeyPrefix}/{session.OriginalFileName}", session.ContentType ?? "application/octet-stream", ct);

            // Create MediaFile
            var mediaFile = new MediaFile
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                User = null!,
                OriginalFileName = session.OriginalFileName,
                ContentType = session.ContentType ?? "application/octet-stream",
                OriginalPath = savedPath,
                SizeBytes = fileStream.Length, // Use actual length
                FileType = DetermineFileType(session.ContentType),
                CreatedAtUtc = DateTime.UtcNow
                // Duration is unknown at this stage without processing
            };

            _context.MediaFiles.Add(mediaFile);

            // Link Session
            session.Status = UploadSessionStatus.Completed;
            session.CompletedAtUtc = DateTime.UtcNow;
            session.MediaFileId = mediaFile.Id;
        
            await _context.SaveChangesAsync(ct);

            return mediaFile;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to finalize upload for session {SessionId}", sessionId);
            
            // Mark session as Failed
            session.Status = UploadSessionStatus.Failed;
            session.CompletedAtUtc = DateTime.UtcNow; // Or maybe create a FailedAtUtc? Prompt said: "CompletedAtUtc = now"
            
            await _context.SaveChangesAsync(ct);
            
            throw; // Re-throw original exception
        }
    }

    private async Task<PlanDefinition> GetUserPlanDefinitionAsync(string userId, CancellationToken ct)
    {
        var subscription = await _context.Subscriptions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == SubscriptionStatus.Active, ct);

        var planType = subscription?.Plan ?? PlanType.Free;
        
        return _plansOptions.Plans.FirstOrDefault(p => p.PlanType == planType) 
               ?? _plansOptions.Plans.First(p => p.PlanType == PlanType.Free);
    }

    private MediaFileType DetermineFileType(string? contentType)
    {
        if (string.IsNullOrWhiteSpace(contentType)) return MediaFileType.Audio; // Default
        return contentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase) 
            ? MediaFileType.Video 
            : MediaFileType.Audio;
    }
}
