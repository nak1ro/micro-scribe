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
        await ValidatePlanLimitsAsync(userId, request.SizeBytes, ct);

        var existingSession = await CheckIdempotencyAsync(request.ClientRequestId, userId, ct);
        if (existingSession != null)
        {
            return await RefreshAndReturnExistingSessionAsync(existingSession, request, ct);
        }

        var uniqueId = Guid.NewGuid();
        var storageKey = $"uploads/{userId}/{uniqueId}{Path.GetExtension(request.FileName)}";

        var (uploadUrl, uploadId, urlExpiry) = await DetermineUploadStrategyAsync(storageKey, request, ct);
        
        var session = CreateSessionEntity(uniqueId, userId, request, storageKey, uploadId, urlExpiry);

        _context.UploadSessions.Add(session);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Created upload session {SessionId} for file {FileName}", session.Id, request.FileName);

        return MapToResponse(session, uploadUrl, uploadId);
    }

    public async Task<UploadSessionStatusResponse> CompleteUploadAsync(Guid sessionId, CompleteUploadRequest request, string userId, CancellationToken ct)
    {
        var session = await GetSessionOrThrowAsync(sessionId, userId, ct);

        if (IsSessionCompleted(session))
            return MapToStatusResponse(session);

        ValidateSessionForCompletion(session);

        var finalObjectInfo = await FinalizeStorageAsync(session, request, ct);

        await UpdateSessionFinalStateAsync(session, finalObjectInfo, ct);

        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            _logger.LogWarning("Concurrency conflict updating session {SessionId}, reloading...", sessionId);
            await _context.Entry(session).ReloadAsync(ct);
            if (IsSessionCompleted(session)) return MapToStatusResponse(session);
            throw;
        }

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
        var session = await _context.UploadSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);
        if (session == null) return;

        await CleanupStorageAsync(session, ct);

        session.Status = UploadSessionStatus.Aborted;
        session.DeletedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    // Helpers

    private async Task ValidatePlanLimitsAsync(string userId, long sizeBytes, CancellationToken ct)
    {
        var user = await _context.Users.FindAsync([userId], ct);
        if (user == null) throw new UnauthorizedAccessException("User not found.");

        var plan = _planResolver.GetPlanDefinition(user.Plan);
        _planGuard.EnsureFileSize(plan, sizeBytes);
    }

    private async Task<UploadSession?> CheckIdempotencyAsync(string? clientRequestId, string userId, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(clientRequestId)) return null;
        return await _context.UploadSessions.FirstOrDefaultAsync(s => s.UserId == userId && s.ClientRequestId == clientRequestId, ct);
    }

    private async Task<UploadSessionResponse> RefreshAndReturnExistingSessionAsync(UploadSession session, InitiateUploadRequest request, CancellationToken ct)
    {
        string? uploadUrl = null;
        if (session.Status is UploadSessionStatus.Created or UploadSessionStatus.Uploading && session.UploadId == null)
        {
            // Regenerate URL if expired or for immediate use
            if (session.UrlExpiresAtUtc == null || session.UrlExpiresAtUtc < DateTime.UtcNow)
            {
                var urlResult = await _storageService.GenerateUploadUrlAsync(session.StorageKey, session.DeclaredContentType, session.SizeBytes, ct);
                uploadUrl = urlResult.UploadUrl;
                session.UrlExpiresAtUtc = urlResult.ExpiresAt;
                await _context.SaveChangesAsync(ct);
            }
            else
            {
                var urlResult = await _storageService.GenerateUploadUrlAsync(session.StorageKey, session.DeclaredContentType, session.SizeBytes, ct);
                uploadUrl = urlResult.UploadUrl;
            }
        }

        _logger.LogInformation("Returning existing session {SessionId}", session.Id);
        return MapToResponse(session, uploadUrl, session.UploadId);
    }

    private async Task<(string? UploadUrl, string? UploadId, DateTime UrlExpiry)> DetermineUploadStrategyAsync(string storageKey, InitiateUploadRequest request, CancellationToken ct)
    {
        DateTime urlExpiry = DateTime.UtcNow.AddMinutes(_storageSettings.PresignedUrlExpiryMinutes);

        if (request.SizeBytes > _storageSettings.MultipartThresholdBytes)
        {
            var initResult = await _storageService.InitiateMultipartUploadAsync(storageKey, request.ContentType, request.SizeBytes, ct);
            return (null, initResult.UploadId, urlExpiry);
        }

        var urlResult = await _storageService.GenerateUploadUrlAsync(storageKey, request.ContentType, request.SizeBytes, ct);
        return (urlResult.UploadUrl, null, urlResult.ExpiresAt);
    }

    private UploadSession CreateSessionEntity(Guid id, string userId, InitiateUploadRequest request, string storageKey, string? uploadId, DateTime urlExpiry)
    {
        return new UploadSession
        {
            Id = id,
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
            ExpiresAtUtc = DateTime.UtcNow.AddHours(24),
            StorageProvider = _storageSettings.Provider
        };
    }

    private async Task<UploadSession> GetSessionOrThrowAsync(Guid sessionId, string userId, CancellationToken ct)
    {
        var session = await _context.UploadSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);
        if (session == null) throw new KeyNotFoundException($"Upload session {sessionId} not found.");
        return session;
    }

    private bool IsSessionCompleted(UploadSession session)
    {
        return session.Status == UploadSessionStatus.Uploaded || 
               session.Status == UploadSessionStatus.Validating || 
               session.Status == UploadSessionStatus.Ready;
    }

    private void ValidateSessionForCompletion(UploadSession session)
    {
        if (session.Status != UploadSessionStatus.Created && session.Status != UploadSessionStatus.Uploading)
            throw new InvalidOperationException($"Session status is {session.Status}, cannot complete.");
    }

    private async Task<StorageObjectInfo> FinalizeStorageAsync(UploadSession session, CompleteUploadRequest request, CancellationToken ct)
    {
        var existingInfo = await _storageService.GetObjectInfoAsync(session.StorageKey, ct);
        if (existingInfo != null)
        {
            _logger.LogInformation("File already exists in storage for session {SessionId}", session.Id);
            return existingInfo;
        }

        if (session.UploadId != null)
        {
            if (request.Parts == null || !request.Parts.Any())
                throw new ArgumentException("Parts are required for multipart completion.");

            var internalParts = request.Parts.Select(p => new UploadPartInfo(p.PartNumber, p.ETag)).ToList();
            await _storageService.CompleteMultipartUploadAsync(session.StorageKey, session.UploadId, internalParts, ct);
        }

        return await _storageService.GetObjectInfoAsync(session.StorageKey, ct) 
               ?? throw new FileNotFoundException("File not found in storage after completion.");
    }

    private Task UpdateSessionFinalStateAsync(UploadSession session, StorageObjectInfo info, CancellationToken ct)
    {
        session.Status = UploadSessionStatus.Uploaded;
        session.UploadedAtUtc = DateTime.UtcNow;
        session.ETag = info.ETag;
        session.SizeBytes = info.SizeBytes;
        return Task.CompletedTask;
    }

    private async Task CleanupStorageAsync(UploadSession session, CancellationToken ct)
    {
        if (IsSessionCompleted(session))
        {
            try { await _storageService.DeleteAsync(session.StorageKey, ct); } catch {}
        }
        else if (session.Status == UploadSessionStatus.Created && session.UploadId != null)
        {
            await _storageService.AbortMultipartUploadAsync(session.StorageKey, session.UploadId, ct);
        }
    }

    private UploadSessionResponse MapToResponse(UploadSession s, string? uploadUrl, string? uploadId)
    {
        return new UploadSessionResponse(
            s.Id,
            s.Status.ToString(),
            uploadUrl,
            uploadId,
            s.StorageKey,
            uploadId != null ? _storageSettings.PartSizeBytes : s.SizeBytes,
            s.ExpiresAtUtc,
            s.CorrelationId
        );
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
