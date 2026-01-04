namespace ScribeApi.Core.Interfaces;

public record YouTubeVideoDetails(string Title, TimeSpan Duration, string ChannelTitle);
public record YouTubeCaptionTrack(string Language, string TranscriptText);

public interface IYouTubeService
{
    Task<YouTubeVideoDetails> GetVideoDetailsAsync(string videoId, CancellationToken ct);
    Task<YouTubeCaptionTrack> GetCaptionsAsync(string videoId, CancellationToken ct);
}
