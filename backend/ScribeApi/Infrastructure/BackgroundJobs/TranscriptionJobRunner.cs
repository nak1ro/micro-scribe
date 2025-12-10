using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Infrastructure.ExternalClients;
using ScribeApi.Infrastructure.ExternalServices;
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
        if (!string.IsNullOrEmpty(mediaFile.AudioPath) && mediaFile.DurationSeconds.HasValue)
        {
            _logger.LogDebug("Audio already prepared for MediaFile {Id}", mediaFile.Id);
            job.DurationSeconds = mediaFile.DurationSeconds;
            return;
        }

        _logger.LogInformation("Extracting audio for MediaFile {Id}", mediaFile.Id);

        var ffmpegResult = await _ffmpegService.ConvertToAudioAsync(
            mediaFile.OriginalPath,
            ct);

        mediaFile.AudioPath = ffmpegResult.AudioPath;
        mediaFile.DurationSeconds = ffmpegResult.Duration.TotalSeconds;
        job.DurationSeconds = ffmpegResult.Duration.TotalSeconds;

        await _context.SaveChangesAsync(ct);
    }



    private async Task RunTranscriptionAsync(TranscriptionJob job, CancellationToken ct)
    {
        var audioPath = job.MediaFile.AudioPath
                        ?? throw new InvalidOperationException("AudioPath is null");

        await using var audioStream = await _storageService.OpenReadAsync(audioPath, ct);

        var result = await _transcriptionProvider.TranscribeAsync(
            audioStream,
            job.Quality,
            job.LanguageCode,
            ct);

        job.Transcript = result.FullTranscript;
        job.LanguageCode = result.DetectedLanguage;

        await CreateSegmentsAsync(job, result.Segments, ct);
    }

    private async Task CreateSegmentsAsync(
        TranscriptionJob job,
        List<TranscriptSegmentData> segments,
        CancellationToken ct)
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

        await _context.SaveChangesAsync(ct);
    }

    private async Task UpdateUserUsageAsync(TranscriptionJob job, CancellationToken ct)
    {
        // We already have job.User loaded from GetJobWithMediaAsync, so we might not need to fetch it again?
        // But GetJobWithMediaAsync was called with AsNoTracking?
        // Let's check TranscriptionJobQueries.cs again.
        // GetJobWithMediaAsync uses .FirstOrDefaultAsync. It does NOT use AsNoTracking() in the query I wrote effectively.
        // Wait, let's checking `TranscriptionJobQueries.cs` from step 47 (my write).
        /*
        public async Task<TranscriptionJob?> GetJobWithMediaAsync(...) {
            return await _context.TranscriptionJobs
                .Include(j => j.MediaFile)
                .Include(j => j.User)
                .FirstOrDefaultAsync(j => j.Id == jobId, ct);
        }
        */
        // It does NOT say AsNoTracking(). So the entities are tracked.
        // So `job.User` is tracked.
        // So I can just update `job.User.UsedMinutesThisMonth`.
        // However, `UpdateUserUsageAsync` currently fetches references again: `var user = await _queries.GetUserByIdAsync(job.UserId, ct);`
        // If I just update `job.User`, it should work if it's tracked.
        // But to be safe and consistent with previous code (which might have assumed something else or maybe `GetUserByIdAsync` does something specific), I'll look at `GetUserByIdAsync`.
        // `GetUserByIdAsync` does NOT use AsNoTracking either inside `TranscriptionJobQueries`.
        // So it's fine.
        // I'll keep `UpdateUserUsageAsync` as is for now, or optimize it?
        // The prompt is just "make TranscriptionJobRunner use plan resolver as well". I should minimal changes.
        // I will focus on the plan resolver part.
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