using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Domain.Plans;
using ScribeApi.Core.Interfaces;
using ScribeApi.Core.Storage;
using ScribeApi.Infrastructure.BackgroundJobs;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads.Contracts;

public class UploadService : IUploadService
{
    private readonly AppDbContext _context;
    private readonly IFileStorageService _storageService;
    private readonly StorageSettings _storageSettings;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly IPlanGuard _planGuard;
    private readonly IPlanResolver _planResolver;
    private readonly ILogger<UploadService> _logger;

    public UploadService(
        AppDbContext context,
        IFileStorageService storageService,
        IOptions<StorageSettings> storageSettings,
        IBackgroundJobClient backgroundJobClient,
        IPlanGuard planGuard,
        IPlanResolver planResolver,
        ILogger<UploadService> logger)
    {
        _context = context;
        _storageService = storageService;
        _storageSettings = storageSettings.Value;
        _backgroundJobClient = backgroundJobClient;
        _planGuard = planGuard;
        _planResolver = planResolver;
        _logger = logger;
    }

    public async Task<UploadSessionResponse> InitiateUploadAsync(InitiateUploadRequest request, string userId, CancellationToken ct)
    {
        // 0. Plan Validation
        var user = await _context.Users.FindAsync(new object[] { userId }, ct);
        if (user == null)
            throw new UnauthorizedAccessException("User not found.");

        var plan = _planResolver.GetPlanDefinition(user.Plan);
        _planGuard.EnsureFileSize(plan, request.SizeBytes);

        // 1. Idempotency Check
        if (!string.IsNullOrEmpty(request.ClientRequestId))
        {
            var existingSession = await _context.UploadSessions
                .FirstOrDefaultAsync(s => s.UserId == userId && 
                                          s.ClientRequestId == request.ClientRequestId, ct);

            if (existingSession != null)
            {
                // If failed, aborted or expired -> Allow retry (create new)? 
                // Plan said: "If the same client request is replayed, the backend must return the same session"
                // But if it's expired/failed, we probably want to allow a new one or return 409 depending on policy.
                // Assuming we return the existing one if it's still 'active' or 'done'.
                // If it's Expired, sticking to "idempotency" usually means "same result", so returning expired session is technicaly correct,
                // BUT user might want to retry. Let's assume strict idempotency for now: Return what we have.
                
                // If Created/Uploading but URL expired, regenerate URL
                string? existingUrl = null;
                if ((existingSession.Status == UploadSessionStatus.Created || existingSession.Status == UploadSessionStatus.Uploading) 
                    && existingSession.UploadId == null) // Single PUT
                {
                     // Check if URL expired
                     if (existingSession.UrlExpiresAtUtc == null || existingSession.UrlExpiresAtUtc < DateTime.UtcNow)
                     {
                         // Regenerate
                         var urlResult = await _storageService.GenerateUploadUrlAsync(
                            existingSession.StorageKey, 
                            existingSession.DeclaredContentType, 
                            existingSession.SizeBytes, 
                            ct);
                         existingUrl = urlResult.UploadUrl;
                         
                         // Update URL expiry in DB? We don't store the URL, just the time. 
                         // But we should update the entity to reflect a new "window" if strict?
                         // Ideally we update UrlExpiresAtUtc.
                         existingSession.UrlExpiresAtUtc = urlResult.ExpiresAt;
                         await _context.SaveChangesAsync(ct);
                     }
                     else 
                     {
                         // We don't store the URL itself! We can't return it if we don't regenerate it.
                         // Wait, GenerateUploadUrlAsync returns a signed URL. We can't "retrieve" a previously generated one unless we stored it.
                         // Using S3 presigned URLs, they are valid until expiry. We CAN regenerate identical one if we use same params?
                         // No, signature uses timestamp.
                         // So we MUST regenerate it every time we return the session if the client needs it.
                         // But that invalidates the concept of "UrlExpiresAtUtc" stored in DB?
                         // "UrlExpiresAtUtc" in DB is mostly for "when does the *window* close".
                         // Let's just always regenerate if status is Created/Uploading.
                         var urlResult = await _storageService.GenerateUploadUrlAsync(
                            existingSession.StorageKey, 
                            existingSession.DeclaredContentType, 
                            existingSession.SizeBytes, 
                            ct);
                         existingUrl = urlResult.UploadUrl;
                     }
                }
                
                _logger.LogInformation("Returning existing session {SessionId} for client request {ClientRequestId}", 
                    existingSession.Id, request.ClientRequestId);

                return new UploadSessionResponse(
                    existingSession.Id,
                    existingSession.Status.ToString(),
                    existingUrl,
                    existingSession.UploadId,
                    existingSession.StorageKey,
                    existingSession.UploadId != null ? _storageSettings.PartSizeBytes : existingSession.SizeBytes,
                    existingSession.ExpiresAtUtc,
                    existingSession.CorrelationId
                );
            }
        }

        // 2. Generate Key
        var uniqueId = Guid.NewGuid();
        var extension = Path.GetExtension(request.FileName);
        var storageKey = $"uploads/{userId}/{uniqueId}{extension}";
        
        // 3. Determine Strategy
        string? uploadUrl = null;
        string? uploadId = null;
        DateTime urlExpiry = DateTime.UtcNow.AddMinutes(_storageSettings.PresignedUrlExpiryMinutes);
        
        if (request.SizeBytes > _storageSettings.MultipartThresholdBytes)
        {
            // Multipart
            var initResult = await _storageService.InitiateMultipartUploadAsync(
                storageKey, 
                request.ContentType, 
                request.SizeBytes, 
                ct);
            uploadId = initResult.UploadId;
        }
        else
        {
            // Single PUT
            var urlResult = await _storageService.GenerateUploadUrlAsync(
                storageKey, 
                request.ContentType, 
                request.SizeBytes, 
                ct);
            uploadUrl = urlResult.UploadUrl;
            urlExpiry = urlResult.ExpiresAt;
        }

        // 4. Create Entity
        var session = new UploadSession
        {
            Id = uniqueId,
            UserId = userId,
            ClientRequestId = request.ClientRequestId,
            CorrelationId = Guid.NewGuid().ToString(),
            FileName = request.FileName,
            DeclaredContentType = request.ContentType,
            SizeBytes = request.SizeBytes,
            StorageKey = storageKey,
            UploadId = uploadId,
            BucketName = _storageService.BucketName,
            Status = UploadSessionStatus.Created,
            CreatedAtUtc = DateTime.UtcNow,
            UrlExpiresAtUtc = urlExpiry,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(24), // Hard limit for session life
            StorageProvider = _storageSettings.Provider
        };

        _context.UploadSessions.Add(session);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Created upload session {SessionId} for file {FileName}", session.Id, request.FileName);

        return new UploadSessionResponse(
            session.Id,
            session.Status.ToString(),
            uploadUrl,
            session.UploadId,
            session.StorageKey,
            session.UploadId != null ? _storageSettings.PartSizeBytes : session.SizeBytes,
            session.ExpiresAtUtc,
            session.CorrelationId
        );
    }

    public async Task<UploadSessionStatusResponse> CompleteUploadAsync(Guid sessionId, CompleteUploadRequest request, string userId, CancellationToken ct)
    {
        var session = await _context.UploadSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);

        if (session == null)
            throw new KeyNotFoundException($"Upload session {sessionId} not found.");

        if (session.Status == UploadSessionStatus.Uploaded || session.Status == UploadSessionStatus.Validating || session.Status == UploadSessionStatus.Ready)
        {
             // Idempotent success
             return MapToStatusResponse(session);
        }
        
        if (session.Status != UploadSessionStatus.Created && session.Status != UploadSessionStatus.Uploading)
        {
             throw new InvalidOperationException($"Session status is {session.Status}, cannot complete.");
        }

        // 0. Pre-check existence locally to avoid erroring on multipart complete if already done but DB failed update
        var existingInfo = await _storageService.GetObjectInfoAsync(session.StorageKey, ct);
        if (existingInfo != null)
        {
            // Already exists in storage! Skip completion logic and go straight to update.
            _logger.LogInformation("File already exists in storage for session {SessionId}, skipping upload completion calls", sessionId);
        }
        else
        {
            // 1. Storage Completion
            if (session.UploadId != null)
            {
                if (request.Parts == null || !request.Parts.Any())
                    throw new ArgumentException("Parts are required for multipart completion.");

                var internalParts = request.Parts
                    .Select(p => new UploadPartInfo(p.PartNumber, p.ETag))
                    .ToList();

                try 
                {
                    await _storageService.CompleteMultipartUploadAsync(session.StorageKey, session.UploadId, internalParts, ct);
                }
                catch (Exception ex)
                {
                     _logger.LogError(ex, "Failed to complete multipart upload for session {SessionId}", sessionId);
                     // If it failed because it doesn't exist, we throw. 
                     // But if it failed because it's ALREADY completed? S3 might throw.
                     // The getObjectInfo check above hopefully mitigates this.
                     throw;
                }
            }
            
            // 2. Refresh info
            existingInfo = await _storageService.GetObjectInfoAsync(session.StorageKey, ct);
            if (existingInfo == null)
                throw new FileNotFoundException("File not found in storage after completion.");
        }

        session.Status = UploadSessionStatus.Uploaded;
        session.UploadedAtUtc = DateTime.UtcNow;
        session.ETag = existingInfo.ETag;
        session.SizeBytes = existingInfo.SizeBytes; // Update with actual size

        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            _logger.LogWarning("Concurrency conflict updating session {SessionId} completion. verifying status...", sessionId);
            // Reload
            await _context.Entry(session).ReloadAsync(ct);
            if (session.Status == UploadSessionStatus.Uploaded || session.Status == UploadSessionStatus.Validating || session.Status == UploadSessionStatus.Ready)
            {
                return MapToStatusResponse(session);
            }
            throw; // Re-throw if it wasn't a successful completion by someone else
        }

        // 3. Background Validation (Enqueued only if we successfully transitioned to Uploaded)
        _backgroundJobClient.Enqueue<FileValidationJob>(job => job.ValidateFileAsync(session.Id, CancellationToken.None));
        
        return MapToStatusResponse(session);
    }

    public async Task<UploadSessionStatusResponse> GetSessionStatusAsync(Guid sessionId, string userId, CancellationToken ct)
    {
         var session = await _context.UploadSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);

        if (session == null)
            throw new KeyNotFoundException($"Upload session {sessionId} not found.");

        return MapToStatusResponse(session);
    }

    public async Task AbortSessionAsync(Guid sessionId, string userId, CancellationToken ct)
    {
        var session = await _context.UploadSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);

        if (session == null) return; // Idempotent

        if (session.Status == UploadSessionStatus.Ready || session.Status == UploadSessionStatus.Uploaded)
        {
             // Cleanup file?
             try {
                await _storageService.DeleteAsync(session.StorageKey, ct);
             } catch {}
        }
        else if (session.Status == UploadSessionStatus.Created && session.UploadId != null)
        {
             await _storageService.AbortMultipartUploadAsync(session.StorageKey, session.UploadId, ct);
        }
        
        session.Status = UploadSessionStatus.Aborted;
        session.DeletedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    private static UploadSessionStatusResponse MapToStatusResponse(UploadSession s)
    {
        return new UploadSessionStatusResponse(
            s.Id,
            s.Status.ToString(),
            s.ErrorMessage,
            s.CreatedAtUtc,
            s.UploadedAtUtc,
            s.ValidatedAtUtc
        );
    }
}
