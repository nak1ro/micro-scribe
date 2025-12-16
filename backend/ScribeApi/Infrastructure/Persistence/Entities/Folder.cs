namespace ScribeApi.Infrastructure.Persistence.Entities;

// Predefined folder colors
public enum FolderColor
{
    Blue = 0,
    Green = 1,
    Purple = 2,
    Orange = 3,
    Red = 4,
    Gray = 5
}

public class Folder
{
    // Unique identifier
    public Guid Id { get; set; }

    // FK to owning user
    public required string UserId { get; set; }

    // Folder display name
    public required string Name { get; set; }

    // Folder color for UI
    public FolderColor Color { get; set; } = FolderColor.Blue;

    // When the folder was created
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Nav
    public ApplicationUser User { get; set; } = null!;
    public ICollection<FolderTranscriptionJob> FolderTranscriptionJobs { get; set; } = new List<FolderTranscriptionJob>();
}
