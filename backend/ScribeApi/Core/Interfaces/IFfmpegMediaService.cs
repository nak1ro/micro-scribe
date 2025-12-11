using ScribeApi.Infrastructure.MediaProcessing;

namespace ScribeApi.Core.Interfaces;

public interface IFfmpegMediaService
{
    Task<FfmpegResult> ConvertToAudioAsync(string inputPath, CancellationToken ct);
    Task<TimeSpan> GetDurationAsync(string inputPath, CancellationToken ct);
}
