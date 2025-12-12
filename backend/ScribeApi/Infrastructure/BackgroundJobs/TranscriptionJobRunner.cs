using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Media.Contracts;
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
    private readonly ILogger<TranscriptionJobRunner> _logger;

    public TranscriptionJobRunner(
        AppDbContext context,
        ITranscriptionJobQueries queries,
        IFfmpegMediaService ffmpegService,
        ITranscriptionProvider transcriptionProvider,
        IFileStorageService storageService,
        IMediaService mediaService,
        ILogger<TranscriptionJobRunner> logger)
    {
        _context = context;
        _queries = queries;
        _ffmpegService = ffmpegService;
        _transcriptionProvider = transcriptionProvider;
        _storageService = storageService;
        _mediaService = mediaService;
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
            await MarkAsProcessingAsync(job!, ct);
            await PrepareAudioAsync(job!, ct);
            await RunTranscriptionAsync(job!, ct);
            await UpdateUserUsageAsync(job!, ct);
            await MarkAsCompletedAsync(job!, ct);

            _logger.LogInformation("Transcription job {JobId} completed", jobId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Transcription job {JobId} failed", jobId);
            await MarkAsFailedAsync(job!, ex.Message, ct);
            // We do NOT rethrow to prevent Hangfire from retrying indefinitely on logic errors.
            // If you want retries for transient errors, you'd need specific logic here.
        }
        finally
        {
            if (job?.MediaFile != null)
            {
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

        // Skip if audio already prepared
        // Skip if audio already prepared
        if (!string.IsNullOrEmpty(mediaFile.NormalizedAudioObjectKey) && mediaFile.DurationSeconds.HasValue)
        {
            _logger.LogDebug("Audio already prepared for MediaFile {Id}, skipping extraction", mediaFile.Id);
            job.DurationSeconds = mediaFile.DurationSeconds;
            return;
        }

        _logger.LogInformation("Extracting audio for MediaFile {Id}", mediaFile.Id);

        var ffmpegResult = await _ffmpegService.ConvertToAudioAsync(
            mediaFile.StorageObjectKey,
            ct);

        mediaFile.NormalizedAudioObjectKey = ffmpegResult.AudioPath;
        mediaFile.DurationSeconds = ffmpegResult.Duration.TotalSeconds;
        job.DurationSeconds = ffmpegResult.Duration.TotalSeconds;

        await _context.SaveChangesAsync(ct);
    }



    private async Task RunTranscriptionAsync(TranscriptionJob job, CancellationToken ct)
    {
        var audioPath = job.MediaFile.NormalizedAudioObjectKey
                        ?? throw new InvalidOperationException("NormalizedAudioObjectKey is null");

        await using var audioStream = await _storageService.OpenReadAsync(audioPath, ct);

        var result = await _transcriptionProvider.TranscribeAsync(
            audioStream,
            Path.GetFileName(audioPath),
            job.Quality,
            job.LanguageCode,
            ct);

        job.Transcript = result.FullTranscript;
        job.LanguageCode = result.DetectedLanguage;

        AddSegments(job, result.Segments);
        
        await _context.SaveChangesAsync(ct);
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
        if (job.DurationSeconds.HasValue)
        {
             job.User.UsedMinutesThisMonth += job.DurationSeconds.Value / 60.0;
             await _context.SaveChangesAsync(ct);
             
             _logger.LogInformation("Updated usage for user {UserId}: +{Minutes:F2} min", job.UserId, job.DurationSeconds.Value / 60.0);
        }
    }

    private async Task MarkAsCompletedAsync(TranscriptionJob job, CancellationToken ct)
    {
        job.Status = TranscriptionJobStatus.Completed;
        job.CompletedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
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
    }
}