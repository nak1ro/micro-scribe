using ScribeApi.Core.Domain.Plans;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Uploads.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Infrastructure.Storage;

namespace ScribeApi.Features.Uploads.Services;

public class UploadService : IUploadService
{
    private readonly AppDbContext _context;
    private readonly IUploadQueries _queries;
    private readonly IPlanResolver _planResolver;
    private readonly IPlanGuard _planGuard;
    private readonly IFileStorageService _storageService;
    private readonly IFfmpegMediaService _ffmpegService;
    private readonly ILogger<UploadService> _logger;
    
    public UploadService(
        AppDbContext context,
        IUploadQueries queries,
        IPlanResolver planResolver,
        IPlanGuard planGuard,
        IFileStorageService storageService,
        IFfmpegMediaService ffmpegService,
        ILogger<UploadService> logger)
    {
        _context = context;
        _queries = queries;
        _planResolver = planResolver;
        _planGuard = planGuard;
        _storageService = storageService;
        _ffmpegService = ffmpegService;
        _logger = logger;
    }

    public async Task<UploadSession> CreateSessionAsync(string userId, InitUploadRequest request, CancellationToken ct)
    {
        if (request.ChunkSizeBytes <= 0)
        {
            throw new ArgumentException("ChunkSizeBytes must be greater than 0.");
        }

        // Validate plan limits
        var planType = await _queries.GetUserPlanTypeAsync(userId, ct);
        var plan = _planResolver.GetPlanDefinition(planType);

        _planGuard.EnsureFileSize(plan, request.TotalSizeBytes);
        _planGuard.EnsureAudioDuration(plan, request.DurationMinutes);

        var totalChunks = CalculateTotalChunks(request);

        var session = new UploadSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            User = null!,
            OriginalFileName = request.FileName,
            ContentType = request.ContentType,
            TotalSizeBytes = request.TotalSizeBytes,
            TotalChunks = totalChunks,
            ReceivedChunksCount = 0,
            UploadedChunkIndices = [],
            StorageKeyPrefix = $"uploads/{userId}/{Guid.NewGuid()}",
            Status = UploadSessionStatus.Active,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(24)
        };

        _context.UploadSessions.Add(session);
        await _context.SaveChangesAsync(ct);

        return session;
    }

    public async Task<MediaFile?> UploadChunkAsync(Guid sessionId, int chunkIndex, Stream chunkStream, string userId,
        CancellationToken ct)
    {
        var session = await GetAndValidateSessionAsync(sessionId, userId, ct);

        ValidateChunkIndex(chunkIndex, session.TotalChunks);

        // Idempotency: skip if already uploaded
        if (session.UploadedChunkIndices.Contains(chunkIndex))
        {
            return await CheckForCompletionAndAssembleAsync(session, ct);
        }

        await SaveChunkToStorageAsync(session, chunkIndex, chunkStream, ct);
        await UpdateSessionProgressAsync(session, chunkIndex, ct);

        return await CheckForCompletionAndAssembleAsync(session, ct);
    }


    private static int CalculateTotalChunks(InitUploadRequest request)
    {
        return (int)Math.Ceiling((double)request.TotalSizeBytes / request.ChunkSizeBytes);
    }

    private async Task<UploadSession> GetAndValidateSessionAsync(Guid sessionId, string userId, CancellationToken ct)
    {
        var session = await _queries.GetSessionAsync(sessionId, userId, ct);

        if (session == null)
            throw new KeyNotFoundException("Upload session not found or does not belong to user.");

        if (session.Status != UploadSessionStatus.Active)
            throw new InvalidOperationException($"Session is not active. Current status: {session.Status}");

        if (session.ExpiresAtUtc >= DateTime.UtcNow) return session;

        session.Status = UploadSessionStatus.Expired;
        await _context.SaveChangesAsync(ct);
        throw new TimeoutException($"Upload session expired at {session.ExpiresAtUtc} UTC.");
    }

    private static void ValidateChunkIndex(int chunkIndex, int totalChunks)
    {
        if (chunkIndex < 0 || chunkIndex >= totalChunks)
        {
            throw new ArgumentOutOfRangeException(nameof(chunkIndex),
                $"Chunk index {chunkIndex} is out of range (0-{totalChunks - 1}).");
        }
    }

    private async Task SaveChunkToStorageAsync(UploadSession session, int chunkIndex, Stream chunkStream,
        CancellationToken ct)
    {
        var chunkPath = $"{session.StorageKeyPrefix}/chunk_{chunkIndex}";

        try
        {
            await _storageService.SaveAsync(chunkStream, chunkPath, session.ContentType ?? "application/octet-stream",
                ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save chunk {ChunkIndex} for session {SessionId}", chunkIndex, session.Id);
            throw;
        }
    }

    private async Task UpdateSessionProgressAsync(UploadSession session, int chunkIndex, CancellationToken ct)
    {
        session.UploadedChunkIndices.Add(chunkIndex);
        session.ReceivedChunksCount = session.UploadedChunkIndices.Count;
        await _context.SaveChangesAsync(ct);
    }

    private async Task<MediaFile?> CheckForCompletionAndAssembleAsync(UploadSession session, CancellationToken ct)
    {
        if (session.ReceivedChunksCount == session.TotalChunks)
        {
            return await AssembleFileAsync(session, ct);
        }

        return null;
    }

    private async Task<MediaFile> AssembleFileAsync(UploadSession session, CancellationToken ct)
    {
        // Re-check expiration before intensive op
        if (session.ExpiresAtUtc < DateTime.UtcNow)
        {
            session.Status = UploadSessionStatus.Expired;
            await _context.SaveChangesAsync(ct);
            throw new TimeoutException("Session expired during assembly.");
        }

        try
        {
            var tempFile = Path.GetTempFileName();
            long assembledSize;

            try
            {
                assembledSize = await MergeChunksToTempFileAsync(session, tempFile, ct);

                // Validate
                if (session.TotalSizeBytes.HasValue)
                {
                    var diff = Math.Abs(assembledSize - session.TotalSizeBytes.Value);
                    if (diff > session.TotalSizeBytes.Value * 0.1)
                    {
                        throw new ArgumentException("Assembled size differs significantly from declared size.");
                    }
                }

                // Validate Duration (actual file duration)
                var duration = await _ffmpegService.GetDurationAsync(tempFile, ct);
                var planType = await _queries.GetUserPlanTypeAsync(session.UserId, ct);
                var plan = _planResolver.GetPlanDefinition(planType);
                _planGuard.EnsureAudioDuration(plan, duration.TotalMinutes);

                // Upload Final
                var savedPath = await UploadFinalFileAsync(session, tempFile, ct);
                
                // Create Record
                var mediaFile =
                    await FinalizeSessionAsync(session, savedPath, assembledSize, duration.TotalSeconds, ct);

                return mediaFile;
            }
            finally
            {
                if (File.Exists(tempFile)) File.Delete(tempFile);
                await CleanupChunksAsync(session);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to assemble file for session {SessionId}", session.Id);
            session.Status = UploadSessionStatus.Failed;
            session.CompletedAtUtc = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);
            throw;
        }
    }

    private async Task<long> MergeChunksToTempFileAsync(UploadSession session, string tempFilePath,
        CancellationToken ct)
    {
        session.UploadedChunkIndices.Sort();

        await using var outputStream = File.OpenWrite(tempFilePath);

        foreach (var index in session.UploadedChunkIndices)
        {
            var chunkPath = $"{session.StorageKeyPrefix}/chunk_{index}";
            await using var chunkStream = await _storageService.OpenReadAsync(chunkPath, ct);
            await chunkStream.CopyToAsync(outputStream, ct);
        }

        return outputStream.Length;
    }


    private async Task<string> UploadFinalFileAsync(UploadSession session, string tempFilePath, CancellationToken ct)
    {
        var finalPath = $"{session.StorageKeyPrefix}/{session.OriginalFileName}";
        await using var readTemp = File.OpenRead(tempFilePath);
        return await _storageService.SaveAsync(readTemp, finalPath, session.ContentType ?? "application/octet-stream",
            ct);
    }

    private async Task CleanupChunksAsync(UploadSession session)
    {
        foreach (var index in session.UploadedChunkIndices)
        {
            var chunkPath = $"{session.StorageKeyPrefix}/chunk_{index}";
            try
            {
                await _storageService.DeleteAsync(chunkPath, CancellationToken.None);
            }
            catch
            {
                // Ignore cleanup errors
            }
        }
    }

    private async Task<MediaFile> FinalizeSessionAsync(UploadSession session, string savedPath, long sizeBytes,
        double durationSeconds,
        CancellationToken ct)
    {
        var mediaFile = new MediaFile
        {
            Id = Guid.NewGuid(),
            UserId = session.UserId,
            User = null!,
            OriginalFileName = session.OriginalFileName,
            ContentType = session.ContentType ?? "application/octet-stream",
            OriginalPath = savedPath,
            SizeBytes = sizeBytes,
            FileType = DetermineFileType(session.ContentType),
            DurationSeconds = durationSeconds,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.MediaFiles.Add(mediaFile);

        session.Status = UploadSessionStatus.Completed;
        session.CompletedAtUtc = DateTime.UtcNow;
        session.MediaFileId = mediaFile.Id;

        await _context.SaveChangesAsync(ct);
        return mediaFile;
    }

    private static MediaFileType DetermineFileType(string? contentType)
    {
        if (string.IsNullOrWhiteSpace(contentType)) return MediaFileType.Audio;
        return contentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase)
            ? MediaFileType.Video
            : MediaFileType.Audio;
    }
}