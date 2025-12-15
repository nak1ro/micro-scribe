namespace ScribeApi.Core.Configuration;

public class TranscriptionSettings
{
    // Duration of each audio chunk in minutes
    public int ChunkDurationMinutes { get; set; } = 10;
    
    // Only chunk files longer than this threshold (minutes)
    public int ChunkThresholdMinutes { get; set; } = 30;
    
    public TimeSpan ChunkDuration => TimeSpan.FromMinutes(ChunkDurationMinutes);
    public TimeSpan ChunkThreshold => TimeSpan.FromMinutes(ChunkThresholdMinutes);
}
