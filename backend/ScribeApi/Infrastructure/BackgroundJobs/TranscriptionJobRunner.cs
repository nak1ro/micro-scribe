using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Exceptions;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Features.Webhooks.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Infrastructure.Storage;

namespace ScribeApi.Infrastructure.BackgroundJobs;

public class TranscriptionJobRunner
{
    private readonly AppDbContext _context;
    private readonly ITranscriptionJobQueries _queries;
    private readonly IFfmpegMediaService _ffmpegService;
    private readonly ITranscriptionProvider _transcriptionProvider;
    private readonly IFileStorageService _storageService;
    private readonly IMediaService _mediaService;
    private readonly IWebhookService _webhookService;
    private readonly ILogger<TranscriptionJobRunner> _logger;

    public TranscriptionJobRunner(
        AppDbContext context,
        ITranscriptionJobQueries queries,
        IFfmpegMediaService ffmpegService,
        ITranscriptionProvider transcriptionProvider,
        IFileStorageService storageService,
        IMediaService mediaService,
        IWebhookService webhookService,
        ILogger<TranscriptionJobRunner> logger)
    {
        _context = context;
        _queries = queries;
        _ffmpegService = ffmpegService;
        _transcriptionProvider = transcriptionProvider;
        _storageService = storageService;
        _mediaService = mediaService;
        _webhookService = webhookService;
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
            await PrepareAudioAsync(job!, ct);

            _logger.LogDebug("[Job {JobId}] Step 3: Running transcription. AudioPath: {AudioPath}, Duration: {Duration}s", 
                jobId, job.MediaFile?.NormalizedAudioObjectKey, job.DurationSeconds);
            await RunTranscriptionAsync(job!, ct);

            _logger.LogDebug("[Job {JobId}] Step 4: Updating user usage", jobId);
            await UpdateUserUsageAsync(job!, ct);

            _logger.LogDebug("[Job {JobId}] Step 5: Marking as completed", jobId);
            await MarkAsCompletedAsync(job!, ct);

            _logger.LogInformation("Transcription job {JobId} completed successfully", jobId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Job {JobId}] FAILED at exception. Type: {ExType}, Message: {Message}", 
                jobId, ex.GetType().Name, ex.Message);
            
            // Log inner exception if present
            if (ex.InnerException != null)
            {
                _logger.LogError("[Job {JobId}] Inner exception: {InnerType} - {InnerMessage}", 
                    jobId, ex.InnerException.GetType().Name, ex.InnerException.Message);
            }

            await MarkAsFailedAsync(job!, ex.Message, ct);
        }
        finally
        {
            if (job?.MediaFile != null)
            {
                _logger.LogDebug("[Job {JobId}] Cleanup: Deleting media files", jobId);
                await _mediaService.DeleteMediaFilesAsync(job.MediaFile, CancellationToken.None);
            }
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

    private async Task PrepareAudioAsync(TranscriptionJob job, CancellationToken ct)
    {
        var mediaFile = job.MediaFile;

        if (mediaFile == null)
        {
            throw new TranscriptionException("MediaFile is null - cannot prepare audio");
        }

        _logger.LogDebug("[PrepareAudio] MediaFile {Id}: StorageKey={Key}, BucketName={Bucket}", 
            mediaFile.Id, mediaFile.StorageObjectKey, mediaFile.BucketName);

        // Skip if audio already prepared
        if (!string.IsNullOrEmpty(mediaFile.NormalizedAudioObjectKey) && mediaFile.DurationSeconds.HasValue)
        {
            _logger.LogDebug("Audio already prepared for MediaFile {Id}, skipping extraction", mediaFile.Id);
            job.DurationSeconds = mediaFile.DurationSeconds;
            return;
        }

        _logger.LogInformation("Extracting audio for MediaFile {Id} from {StorageKey}", 
            mediaFile.Id, mediaFile.StorageObjectKey);

        try
        {
            var ffmpegResult = await _ffmpegService.ConvertToAudioAsync(
                mediaFile.StorageObjectKey,
                ct);

            _logger.LogDebug("[PrepareAudio] FFmpeg result: AudioPath={Path}, Duration={Duration}s", 
                ffmpegResult.AudioPath, ffmpegResult.Duration.TotalSeconds);

            mediaFile.NormalizedAudioObjectKey = ffmpegResult.AudioPath;
            mediaFile.DurationSeconds = ffmpegResult.Duration.TotalSeconds;
            job.DurationSeconds = ffmpegResult.Duration.TotalSeconds;

            await _context.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PrepareAudio] FFmpeg conversion failed for MediaFile {Id}", mediaFile.Id);
            throw;
        }
    }


    private async Task RunTranscriptionAsync(TranscriptionJob job, CancellationToken ct)
    {
        var audioPath = job.MediaFile.NormalizedAudioObjectKey
                        ?? throw new TranscriptionException("Audio file preparation failed: normalized audio path is missing.");

        _logger.LogDebug("[RunTranscription] Opening audio stream from: {AudioPath}", audioPath);

        try
        {
            await using var audioStream = await _storageService.OpenReadAsync(audioPath, ct);
            
            _logger.LogDebug("[RunTranscription] Audio stream opened. Calling transcription provider. Quality={Quality}, Language={Lang}", 
                job.Quality, job.LanguageCode ?? "auto-detect");

            var result = await _transcriptionProvider.TranscribeAsync(
                audioStream,
                Path.GetFileName(audioPath),
                job.Quality,
                job.LanguageCode,
                ct);

            _logger.LogDebug("[RunTranscription] Transcription complete. Segments: {Count}, DetectedLang: {Lang}", 
                result.Segments.Count, result.DetectedLanguage);

            job.Transcript = result.FullTranscript;
            job.LanguageCode = result.DetectedLanguage;

            AddSegments(job, result.Segments);

            await _context.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RunTranscription] Transcription failed. AudioPath: {Path}", audioPath);
            throw;
        }
    }

    private void AddSegments(
        TranscriptionJob job,
        List<TranscriptSegmentData> segments)
    {
        var order = 0;
        foreach (var segmentData in segments)
        {
            var segment = new TranscriptSegment
            {
                Id = Guid.NewGuid(),
                TranscriptionJobId = job.Id,
                TranscriptionJob = job,
                Text = segmentData.Text,
                StartSeconds = segmentData.StartSeconds,
                EndSeconds = segmentData.EndSeconds,
                Speaker = segmentData.Speaker,
                Order = order++
            };

            _context.TranscriptSegments.Add(segment);
        }
    }

    private async Task UpdateUserUsageAsync(TranscriptionJob job, CancellationToken ct)
    {
        if (!job.DurationSeconds.HasValue) return;

        var usageMinutes = job.DurationSeconds.Value / 60.0;

        await _context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE \"AspNetUsers\" SET \"UsedMinutesThisMonth\" = \"UsedMinutesThisMonth\" + {usageMinutes} WHERE \"Id\" = {job.UserId}",
            ct);

        _logger.LogInformation("Updated usage for user {UserId}: +{Minutes:F2} min", job.UserId, usageMinutes);
    }

    private async Task MarkAsCompletedAsync(TranscriptionJob job, CancellationToken ct)
    {
        // Status is stored as string in PostgreSQL (HasConversion<string>())
        var completedStatus = nameof(TranscriptionJobStatus.Completed);
        var processingStatus = nameof(TranscriptionJobStatus.Processing);
        
        var rowsAffected = await _context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE \"TranscriptionJobs\" SET \"Status\" = {completedStatus}, \"CompletedAtUtc\" = {DateTime.UtcNow} WHERE \"Id\" = {job.Id} AND \"Status\" = {processingStatus}", 
            ct);

        if (rowsAffected == 0)
        {
            _logger.LogWarning("Job {JobId} could not be marked Completed (Status mismatch or deleted).", job.Id);
        }
        else
        {
             job.Status = TranscriptionJobStatus.Completed;
             
             // Trigger webhook
             await _webhookService.EnqueueAsync(job.UserId, WebhookEvents.JobCompleted, new
             {
                 jobId = job.Id,
                 mediaFileId = job.MediaFileId,
                 status = "Completed",
                 durationSeconds = job.DurationSeconds,
                 languageCode = job.LanguageCode
             }, ct);
        }
    }

    private async Task MarkAsFailedAsync(
        TranscriptionJob job,
        string errorMessage,
        CancellationToken ct)
    {
        job.Status = TranscriptionJobStatus.Failed;
        job.ErrorMessage = errorMessage;
        job.CompletedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
        
        _logger.LogDebug("[MarkAsFailed] Job {JobId} marked as failed. Triggering webhook.", job.Id);
        
        try
        {
            await _webhookService.EnqueueAsync(job.UserId, WebhookEvents.JobFailed, new
            {
                jobId = job.Id,
                mediaFileId = job.MediaFileId,
                status = "Failed",
                errorMessage = errorMessage
            }, ct);
        }
        catch (Exception webhookEx)
        {
            // Don't let webhook errors mask the original error
            _logger.LogError(webhookEx, "[MarkAsFailed] Webhook enqueue failed for job {JobId}", job.Id);
        }
    }
}