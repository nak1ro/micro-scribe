namespace ScribeApi.Infrastructure.Persistence.Entities;

public enum MediaFileType
{
    Audio = 0,
    Video = 1
}

public class MediaFile
{
    public Guid Id { get; set; }

    public required string UserId { get; set; }
    public required ApplicationUser User { get; set; }

    public required string OriginalFileName { get; set; }

    public required string ContentType { get; set; }

    public required string OriginalPath { get; set; }

    // Normalized audio (ie wav, mp3 or ogg)
    public string? AudioPath { get; set; }

    public long SizeBytes { get; set; }

    public MediaFileType FileType { get; set; }

    public double? DurationSeconds { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<TranscriptionJob> TranscriptionJobs { get; set; } = new List<TranscriptionJob>();
}