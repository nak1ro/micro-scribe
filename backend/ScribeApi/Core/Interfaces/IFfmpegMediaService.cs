using ScribeApi.Infrastructure.MediaProcessing;

namespace ScribeApi.Core.Interfaces;

// Result from single-file audio conversion
public record FfmpegResult(string AudioPath, TimeSpan Duration);

// Single audio chunk with its time offset
public record AudioChunk(string StoragePath, TimeSpan StartOffset);

// Result from chunked audio conversion
public record AudioChunkResult(List<AudioChunk> Chunks, TimeSpan TotalDuration);

public interface IFfmpegMediaService
{
    // Converts media to audio, returns single file
    Task<FfmpegResult> ConvertToAudioAsync(string inputPath, CancellationToken ct);
    
    // Converts media to audio, splits into chunks if duration exceeds threshold
    Task<AudioChunkResult> ConvertAndChunkAudioAsync(
        string inputPath,
        TimeSpan chunkDuration,
        TimeSpan chunkThreshold,
        CancellationToken ct);
    
    Task<TimeSpan> GetDurationAsync(string inputPath, CancellationToken ct);
}
