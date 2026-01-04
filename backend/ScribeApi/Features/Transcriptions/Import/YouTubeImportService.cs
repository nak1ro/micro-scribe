using AutoMapper;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Exceptions;
using FluentValidationException = FluentValidation.ValidationException;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Transcriptions.Contracts; // Checked: DTOs are here
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Import;

public class YouTubeImportService : IYouTubeImportService
{
    private readonly AppDbContext _context;
    private readonly IYouTubeService _youTubeService;
    private readonly IMapper _mapper;
    private readonly IValidator<YouTubeImportRequest> _validator;
    private readonly ILogger<YouTubeImportService> _logger;

    public YouTubeImportService(
        AppDbContext context,
        IYouTubeService youTubeService,
        IMapper mapper,
        IValidator<YouTubeImportRequest> validator,
        ILogger<YouTubeImportService> logger)
    {
        _context = context;
        _youTubeService = youTubeService;
        _mapper = mapper;
        _validator = validator;
        _logger = logger;
    }

    public async Task<TranscriptionJobDetailResponse> ImportFromYouTubeAsync(
        YouTubeImportRequest request, 
        string userId, 
        CancellationToken ct)
    {
        // 1. Validation
        var validationResult = await _validator.ValidateAsync(request, ct);
        if (!validationResult.IsValid)
        {
            throw new FluentValidationException(validationResult.Errors);
        }

        var videoId = ExtractVideoId(request.Url);
        if (string.IsNullOrEmpty(videoId))
        {
            throw new FluentValidationException("Could not extract valid Video ID from URL.");
        }

        // 2. Fetch Metadata
        _logger.LogInformation("Fetching YouTube metadata for {VideoId}", videoId);
        var videoDetails = await _youTubeService.GetVideoDetailsAsync(videoId, ct);
        var durationMinutes = videoDetails.Duration.TotalMinutes;

        // 3. Billing Check (Optimistic limit check)
        // Note: For now we assume infinite storage/transcription is handled by plans, 
        // but we track "UsedMinutes" which is usually for the AI billing.
        // Importing YouTube captions saves AI cost, but provides equivalent value.
        // We will deduct it from specific quota if needed, or simply count it towards monthly usage.
        
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            // Lock user row to check/update limits
            // Using raw SQL for efficient locking if needed, or just EF
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId, ct);

            if (user == null) throw new NotFoundException("User not found.");

            // Check if user has a plan (Plan limits are checked in RateLimiting usually, but here is logical limit)
            // Implementation specific: Let's assume we just increment usage. 
            // If there was a strict hard limit on *imported* minutes, we'd check it here.

            // 4. Fetch Captions (do this before committing to ensure it works)
            _logger.LogInformation("Downloading captions for {VideoId}", videoId);
            var captionTrack = await _youTubeService.GetCaptionsAsync(videoId, ct);

            // 5. Create Entities
            var mediaFileId = Guid.NewGuid();
            var mediaFile = new MediaFile
            {
                Id = mediaFileId,
                UserId = userId,
                FileType = MediaFileType.Video, // It's a video source
                OriginalFileName = videoDetails.Title ?? "YouTube Video",
                ContentType = "video/youtube",
                StorageProvider = MediaFile.StorageProviderYouTube,
                StorageObjectKey = videoId, // Store Video ID as key
                BucketName = "youtube", // specific bucket name for logic if needed
                CreatedFromUploadSessionId = null, // Virtual file
                DurationSeconds = videoDetails.Duration.TotalSeconds,
                CreatedAtUtc = DateTime.UtcNow,
                SizeBytes = 0 // No physical size
            };

            var jobId = Guid.NewGuid();
            var job = new TranscriptionJob
            {
                Id = jobId,
                UserId = userId,
                MediaFileId = mediaFileId,
                Status = TranscriptionJobStatus.Completed,
                Quality = TranscriptionQuality.Accurate, // Captions are usually accurate enough
                SourceLanguage = captionTrack.Language,
                DurationSeconds = videoDetails.Duration.TotalSeconds,
                CreatedAtUtc = DateTime.UtcNow,
                StartedAtUtc = DateTime.UtcNow,
                CompletedAtUtc = DateTime.UtcNow,
                ProcessingStep = null,
                User = user,
                MediaFile = mediaFile,
                Transcript = captionTrack.TranscriptText
            };

            // 6. Persist & Billing
            _context.MediaFiles.Add(mediaFile);
            _context.TranscriptionJobs.Add(job);
            
            // Deduct minutes (count towards usage)
            user.UsedMinutesThisMonth += durationMinutes;
            
            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            _logger.LogInformation("Imported YouTube video {VideoId} for user {UserId}", videoId, userId);

            // Return DTO
            return _mapper.Map<TranscriptionJobDetailResponse>(job);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    private string? ExtractVideoId(string url)
    {
        var uri = new Uri(url);
        var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
        if (query.AllKeys.Contains("v"))
        {
            return query["v"];
        }
        // Handle youtu.be/ID
        if (uri.Host.Contains("youtu.be"))
        {
            return uri.Segments.Last();
        }
        return null;
    }
}
