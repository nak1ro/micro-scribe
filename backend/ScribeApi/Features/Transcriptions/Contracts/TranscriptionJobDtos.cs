using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Contracts
{
    // Request to start a transcription job
    public record CreateTranscriptionJobRequest(
        Guid? MediaFileId,
        Guid? UploadSessionId,
        TranscriptionQuality Quality = TranscriptionQuality.Balanced,
        string? LanguageCode = null,
        bool EnableSpeakerDiarization = false,
        string? TargetLanguage = null
    );

    // Request to translate an existing job
    public record TranslateJobRequest(string TargetLanguage);

    // Response after job creation
    public class TranscriptionJobResponse
    {
        public Guid JobId { get; init; }
        public Guid MediaFileId { get; init; }
        public TranscriptionJobStatus Status { get; init; }
        public DateTime CreatedAtUtc { get; init; }
    }

    // Speaker metadata DTO
    public class TranscriptionSpeakerDto
    {
        public string Id { get; init; } = string.Empty;
        public string? DisplayName { get; init; }
        public string? Color { get; init; }
    }

    // Detailed job response (for GET endpoints)
    public class TranscriptionJobDetailResponse
    {
        public Guid JobId { get; init; }
        public Guid MediaFileId { get; init; }
        public string OriginalFileName { get; init; } = string.Empty;
        public TranscriptionJobStatus Status { get; init; }
        public TranscriptionQuality Quality { get; init; }
        public string? LanguageCode { get; init; }
        public string? TargetLanguage { get; init; }
        public string? Transcript { get; init; }
        public string? ErrorMessage { get; init; }
        public double? DurationSeconds { get; init; }
        public List<TranscriptSegmentDto> Segments { get; init; } = new();
        public bool EnableSpeakerDiarization { get; init; }
        public List<TranscriptionSpeakerDto> Speakers { get; init; } = new();
        public DateTime CreatedAtUtc { get; init; }
        public DateTime? StartedAtUtc { get; init; }
        public DateTime? CompletedAtUtc { get; init; }
        public string? PresignedUrl { get; set; }
    }

    // Segment DTO with timestamps
    public class TranscriptSegmentDto
    {
        public Guid Id { get; init; }
        public string Text { get; init; } = string.Empty;
        public double StartSeconds { get; init; }
        public double EndSeconds { get; init; }
        public string? Speaker { get; init; }
        public string? TranslatedText { get; init; }
        public bool IsEdited { get; init; }
        public string? OriginalText { get; init; }
    }

    // Request to update a segment
    public record UpdateSegmentRequest(string Text);

    // Export format enum
    public enum ExportFormat
    {
        Txt,
        Srt,
        Vtt,
        Json
    }

    // List item for job list response
    public class TranscriptionJobListItem
    {
        public Guid JobId { get; init; }
        public string OriginalFileName { get; init; } = string.Empty;
        public TranscriptionJobStatus Status { get; init; }
        public TranscriptionQuality Quality { get; init; }
        public string? LanguageCode { get; init; }
        public double? DurationSeconds { get; init; }
        public string? TranscriptPreview { get; init; }
        public DateTime CreatedAtUtc { get; init; }
        public DateTime? CompletedAtUtc { get; init; }
    }
}