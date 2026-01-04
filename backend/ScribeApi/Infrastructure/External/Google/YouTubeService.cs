using System.Xml;
using Google.Apis.Services;
using GoogleYouTubeService = Google.Apis.YouTube.v3.YouTubeService;
using Google.Apis.YouTube.v3; // Keep for other types like CaptionsResource
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Interfaces;

namespace ScribeApi.Infrastructure.External.Google;

public class YouTubeService : IYouTubeService
{
    private readonly YouTubeSettings _settings;
    private readonly ILogger<YouTubeService> _logger;
    private readonly GoogleYouTubeService _youtubeService; // Google's service client

    public YouTubeService(
        IOptions<YouTubeSettings> settings,
        ILogger<YouTubeService> logger)
    {
        _settings = settings.Value;
        _logger = logger;

        _youtubeService = new GoogleYouTubeService(new BaseClientService.Initializer
        {
            ApiKey = _settings.ApiKey,
            ApplicationName = _settings.ApplicationName
        });
    }

    public async Task<YouTubeVideoDetails> GetVideoDetailsAsync(string videoId, CancellationToken ct)
    {
        var request = _youtubeService.Videos.List("snippet,contentDetails");
        request.Id = videoId;

        var response = await request.ExecuteAsync(ct);
        var video = response.Items.FirstOrDefault();

        if (video == null)
        {
            throw new Exception($"Video {videoId} not found.");
        }

        var duration = XmlConvert.ToTimeSpan(video.ContentDetails.Duration);

        return new YouTubeVideoDetails(
            Title: video.Snippet.Title,
            Duration: duration,
            ChannelTitle: video.Snippet.ChannelTitle
        );
    }

    public async Task<YouTubeCaptionTrack> GetCaptionsAsync(string videoId, CancellationToken ct)
    {
        // 1. List valid caption tracks
        var listRequest = _youtubeService.Captions.List("snippet", videoId);
        var listResponse = await listRequest.ExecuteAsync(ct);

        // Prefer exact matches for English, then auto-generated, then anything
        var track = listResponse.Items
            .OrderByDescending(t => t.Snippet.Language == "en")
            .ThenByDescending(t => t.Snippet.TrackKind == "standard") 
            .FirstOrDefault();

        if (track == null)
        {
            throw new Exception("No captions found for this video.");
        }

        // 2. Download the track
        var downloadRequest = _youtubeService.Captions.Download(track.Id);
        downloadRequest.Tfmt = "srt"; // Request SRT format string directly if enum is unavailable

        using var memoryStream = new MemoryStream();
        await downloadRequest.DownloadAsync(memoryStream, ct);
        
        memoryStream.Position = 0;
        using var reader = new StreamReader(memoryStream);
        var transcriptText = await reader.ReadToEndAsync(ct);

        return new YouTubeCaptionTrack(
            Language: track.Snippet.Language,
            TranscriptText: transcriptText
        );
    }
}
