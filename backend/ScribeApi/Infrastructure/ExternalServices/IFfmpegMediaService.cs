namespace ScribeApi.Infrastructure.ExternalServices;

public interface IFfmpegMediaService
{
    Task<FfmpegResult> ConvertToAudioAsync(string inputPath, CancellationToken ct);
    Task<TimeSpan> GetDurationAsync(string inputPath, CancellationToken ct);
}
