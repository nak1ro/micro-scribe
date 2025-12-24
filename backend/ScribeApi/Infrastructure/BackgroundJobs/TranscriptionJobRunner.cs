using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Exceptions;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Features.Webhooks.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Infrastructure.Transcription;

namespace ScribeApi.Infrastructure.BackgroundJobs;

public class TranscriptionJobRunner
{
    private readonly AppDbContext _context;
    private readonly ITranscriptionJobQueries _queries;
    private readonly IFfmpegMediaService _ffmpegService;
    private readonly ITranscriptionProvider _transcriptionProvider;
    private readonly ChunkedTranscriptionService _chunkedTranscriptionService;
    private readonly IFileStorageService _storageService;
    private readonly IMediaService _mediaService;
    private readonly IWebhookService _webhookService;
    private readonly TranscriptionSettings _settings;
    private readonly ILogger<TranscriptionJobRunner> _logger;

    // Track chunk paths for cleanup
    private List<AudioChunk>? _currentChunks;

    public TranscriptionJobRunner(
        AppDbContext context,
        ITranscriptionJobQueries queries,
        IFfmpegMediaService ffmpegService,
        ITranscriptionProvider transcriptionProvider,
        ChunkedTranscriptionService chunkedTranscriptionService,
        IFileStorageService storageService,
        IMediaService mediaService,
        IWebhookService webhookService,
        IOptions<TranscriptionSettings> settings,
        ILogger<TranscriptionJobRunner> logger)
    {
        _context = context;
        _queries = queries;
        _ffmpegService = ffmpegService;
        _transcriptionProvider = transcriptionProvider;
        _chunkedTranscriptionService = chunkedTranscriptionService;
        _storageService = storageService;
        _mediaService = mediaService;
        _webhookService = webhookService;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task RunAsync(Guid jobId, CancellationToken ct)
    {
        _logger.LogInformation("Starting transcription job {JobId}", jobId);

        var job = await _queries.GetJobWithMediaAsync(jobId, ct);

        if (!ValidateJobState(job, jobId))
            return;

        try
        {
            _logger.LogDebug("[Job {JobId}] Step 1: Marking as Processing", jobId);
            await MarkAsProcessingAsync(job!, ct);

            _logger.LogDebug("[Job {JobId}] Step 2: Preparing audio. MediaFile: {MediaFileId}, StorageKey: {Key}", 
                jobId, job!.MediaFile?.Id, job.MediaFile?.StorageObjectKey);
            var chunkResult = await PrepareAudioChunksAsync(job!, ct);

            _logger.LogDebug("[Job {JobId}] Step 3: Running transcription. Chunks: {Count}, Duration: {Duration}s", 
                jobId, chunkResult.Chunks.Count, chunkResult.TotalDuration.TotalSeconds);
            await RunTranscriptionAsync(job!, chunkResult, ct);

            // Step 4 & 5 Combined: Atomic Completion & Usage Update
            _logger.LogDebug("[Job {JobId}] Step 4: Atomic Completion & Billing", jobId);
            await CompleteJobAtomicAsync(jobId, job!.UserId, job!.DurationSeconds, job!.SourceLanguage, ct);

            _logger.LogInformation("Transcription job {JobId} completed successfully", jobId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Job {JobId}] FAILED at exception. Type: {ExType}, Message: {Message}", 
                jobId, ex.GetType().Name, ex.Message);
            
            if (ex.InnerException != null)
            {
                _logger.LogError("[Job {JobId}] Inner exception: {InnerType} - {InnerMessage}", 
                    jobId, ex.InnerException.GetType().Name, ex.InnerException.Message);
            }

            await MarkAsFailedAsync(job!, ex.Message, ct);
            throw; // Rethrow to allow Hangfire to retry (if appropriate) or move to DLQ
        }
        finally
        {
            // Cleanup media files
            // Cleanup media files - REMOVED to allow user playback/download
            // if (job?.MediaFile != null)
            // {
            //     _logger.LogDebug("[Job {JobId}] Cleanup: Deleting media files", jobId);
            //     await _mediaService.DeleteMediaFilesAsync(job.MediaFile, CancellationToken.None);
            // }

            // Cleanup chunk files
            await CleanupChunksAsync();
        }
    }

    private bool ValidateJobState(TranscriptionJob? job, Guid jobId)
    {
        if (job == null)
        {
            _logger.LogWarning("Job {JobId} not found, skipping", jobId);
            return false;
        }

        _logger.LogDebug("[Job {JobId}] Validating state. Current status: {Status}, MediaFile: {HasMedia}", 
            jobId, job.Status, job.MediaFile != null);

        if (job.Status is TranscriptionJobStatus.Completed
            or TranscriptionJobStatus.Failed
            or TranscriptionJobStatus.Cancelled)
        {
            _logger.LogInformation(
                "Job {JobId} already in terminal state {Status}, skipping",
                jobId, job.Status);
            return false;
        }

        return true;
    }

    private async Task MarkAsProcessingAsync(TranscriptionJob job, CancellationToken ct)
    {
        job.Status = TranscriptionJobStatus.Processing;
        job.StartedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    private async Task<AudioChunkResult> PrepareAudioChunksAsync(TranscriptionJob job, CancellationToken ct)
    {
        var mediaFile = job.MediaFile ?? throw new TranscriptionException("MediaFile is null - cannot prepare audio");

        _logger.LogDebug("[PrepareAudio] MediaFile {Id}: StorageKey={Key}, BucketName={Bucket}", 
            mediaFile.Id, mediaFile.StorageObjectKey, mediaFile.BucketName);

        try
        {
            // Use chunking for long audio files
            var chunkResult = await _ffmpegService.ConvertAndChunkAudioAsync(
                mediaFile.StorageObjectKey,
                _settings.ChunkDuration,
                _settings.ChunkThreshold,
                ct);

            _logger.LogDebug("[PrepareAudio] FFmpeg result: Chunks={Count}, Duration={Duration}s", 
                chunkResult.Chunks.Count, chunkResult.TotalDuration.TotalSeconds);

            // Store first chunk path as the normalized audio (for backward compatibility)
            if (chunkResult.Chunks.Count > 0)
            {
                mediaFile.NormalizedAudioObjectKey = chunkResult.Chunks[0].StoragePath;
            }
            
            mediaFile.DurationSeconds = chunkResult.TotalDuration.TotalSeconds;
            job.DurationSeconds = chunkResult.TotalDuration.TotalSeconds;

            // Track chunks for cleanup
            _currentChunks = chunkResult.Chunks;

            await _context.SaveChangesAsync(ct);
            
            return chunkResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PrepareAudio] FFmpeg conversion failed for MediaFile {Id}", mediaFile.Id);
            throw;
        }
    }

    private async Task RunTranscriptionAsync(TranscriptionJob job, AudioChunkResult chunkResult, CancellationToken ct)
    {
        _logger.LogDebug("[RunTranscription] Processing {Count} chunks", chunkResult.Chunks.Count);

        try
        {
            TranscriptionResult result;

            if (chunkResult.Chunks.Count == 1)
            {
                // Single chunk - use direct transcription
                var chunk = chunkResult.Chunks[0];
                await using var audioStream = await _storageService.OpenReadAsync(chunk.StoragePath, ct);
                
                result = await _transcriptionProvider.TranscribeAsync(
                    audioStream,
                    Path.GetFileName(chunk.StoragePath),
                    job.Quality,
                    job.SourceLanguage,
                    ct);
            }
            else
            {
                // Multiple chunks - use chunked transcription service
                result = await _chunkedTranscriptionService.TranscribeChunkedAsync(
                    chunkResult.Chunks,
                    job.Quality,
                    job.SourceLanguage,
                    ct);
            }

            _logger.LogDebug("[RunTranscription] Transcription complete. Segments: {Count}, DetectedLang: {Lang}", 
                result.Segments.Count, result.DetectedLanguage);

            job.Transcript = result.FullTranscript;
            job.SourceLanguage = result.DetectedLanguage;

            AddSegments(job, result.Segments);

            await _context.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RunTranscription] Transcription failed");
            throw;
        }
    }

    private void AddSegments(TranscriptionJob job, List<TranscriptSegmentData> segments)
    {
        job.Segments = segments.Select(segmentData => new TranscriptSegment
        {
            Id = Guid.NewGuid(),
            // No TranscriptionJobId needed for JSONB
            Text = segmentData.Text,
            StartSeconds = segmentData.StartSeconds,
            EndSeconds = segmentData.EndSeconds,
            Speaker = segmentData.Speaker,
            // Order is implicit in list, but we can keep it if needed. 
            // For JSONB, list index is order.
        }).ToList();
    }

    private async Task CompleteJobAtomicAsync(Guid jobId, string userId, double? durationSeconds, string? languageCode, CancellationToken ct)
    {
        // Use Serializable transaction to prevent race with Cancellation
        await using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);
        try
        {
            // Lock and refresh job status
            var job = await _context.TranscriptionJobs
                .FirstOrDefaultAsync(j => j.Id == jobId, ct);

            if (job == null) throw new TranscriptionException($"Job {jobId} disappeared during completion.");

            // RACE CHECK: If Controller cancelled it, we MUST NOT charge and MUST NOT overwrite status
            if (job.Status == TranscriptionJobStatus.Cancelled)
            {
                _logger.LogInformation("Job {JobId} was cancelled by user. Aborting completion logic.", jobId);
                return; // Exit successfully, let the cancellation stand
            }

            // Update Status to Completed
            job.Status = TranscriptionJobStatus.Completed;
            job.CompletedAtUtc = DateTime.UtcNow;

            // Update Usage (Billing)
            if (durationSeconds.HasValue)
            {
                var usageMinutes = durationSeconds.Value / 60.0;
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"UPDATE \"AspNetUsers\" SET \"UsedMinutesThisMonth\" = \"UsedMinutesThisMonth\" + {usageMinutes} WHERE \"Id\" = {userId}",
                    ct);
                _logger.LogInformation("Updated usage for user {UserId}: +{Minutes:F2} min", userId, usageMinutes);
            }

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            // Webhook (outside transaction)
            await _webhookService.EnqueueAsync(userId, WebhookEvents.JobCompleted, new
            {
                jobId,
                status = "Completed",
                durationSeconds,
                languageCode
            }, ct);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    private async Task MarkAsFailedAsync(TranscriptionJob job, string errorMessage, CancellationToken ct)
    {
        // Refresh job to check for cancellation
        var currentStatus = await _context.TranscriptionJobs
            .Where(j => j.Id == job.Id)
            .Select(j => j.Status)
            .FirstOrDefaultAsync(ct);

        if (currentStatus == TranscriptionJobStatus.Cancelled)
        {
             _logger.LogInformation("Job {JobId} is cancelled. Skipping failure marking.", job.Id);
             return;
        }

        job.Status = TranscriptionJobStatus.Failed;
        job.ErrorMessage = errorMessage;
        job.CompletedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
        
        await _webhookService.EnqueueAsync(job.UserId, WebhookEvents.JobFailed, new
        {
            jobId = job.Id,
            mediaFileId = job.MediaFileId,
            status = "Failed",
            errorMessage
        }, ct);
    }

    private async Task CleanupChunksAsync()
    {
        if (_currentChunks == null || _currentChunks.Count <= 1) return;

        _logger.LogDebug("Cleaning up {Count} audio chunks", _currentChunks.Count);

        foreach (var chunk in _currentChunks)
        {
            try
            {
                await _storageService.DeleteAsync(chunk.StoragePath, CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed to delete chunk {Path}: {Error}", chunk.StoragePath, ex.Message);
            }
        }

        _currentChunks = null;
    }
}