namespace ScribeApi.Infrastructure.Persistence.Entities;

public class TranscriptSegment
{
    public Guid Id { get; set; }

    public Guid TranscriptionJobId { get; set; }
    public required TranscriptionJob TranscriptionJob { get; set; }

    // Segment text (sentence or short phrase).
    public required string Text { get; set; }

    // Start time of this segment, in seconds from the beginning of the audio.
    public double StartSeconds { get; set; }

    // End time of this segment, in seconds from the beginning of the audio.
    public double EndSeconds { get; set; }

    // Order of this segment in the transcript.
    public int Order { get; set; }

    // Optional speaker label if you ever support diarization ("Speaker 1", "Speaker 2", ...).
    public string? Speaker { get; set; }
}