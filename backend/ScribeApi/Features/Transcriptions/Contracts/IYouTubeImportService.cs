namespace ScribeApi.Features.Transcriptions.Contracts;

public interface IYouTubeImportService
{
    Task<TranscriptionJobDetailResponse> ImportFromYouTubeAsync(YouTubeImportRequest request, string userId, CancellationToken ct);
}
