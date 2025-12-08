namespace ScribeApi.Infrastructure.Persistence.Entities;

public class TranscriptChapter
{
    public Guid Id { get; set; }

    public Guid TranscriptionJobId { get; set; }
    public required TranscriptionJob TranscriptionJob { get; set; }

    // Display title of the chapter.
    public required string Title { get; set; }

    // Start time of this chapter, in seconds.
    public double StartSeconds { get; set; }

    // Optional end time; you can compute it from the next chapter if you want.
    public double? EndSeconds { get; set; }
    
    // Order of chapters in the transcript.
    public int Order { get; set; }
}