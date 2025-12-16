namespace ScribeApi.Infrastructure.Persistence.Entities;

// Join table for many-to-many between Folder and TranscriptionJob
public class FolderTranscriptionJob
{
    // FK to folder
    public Guid FolderId { get; set; }

    // FK to transcription job
    public Guid TranscriptionJobId { get; set; }

    // When the item was added to folder
    public DateTime AddedAtUtc { get; set; } = DateTime.UtcNow;

    // Nav
    public Folder Folder { get; set; } = null!;
    public TranscriptionJob TranscriptionJob { get; set; } = null!;
}
