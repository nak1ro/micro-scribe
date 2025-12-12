using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Contracts;

// Request to start a transcription job
public record CreateTranscriptionJobRequest(
    Guid? MediaFileId,
    Guid? UploadSessionId,
    TranscriptionQuality Quality = TranscriptionQuality.Balanced,
    string? LanguageCode = null
);

// Response after job creation
public record TranscriptionJobResponse(
    Guid JobId,
    Guid MediaFileId,
    TranscriptionJobStatus Status,
    DateTime CreatedAtUtc
);

// Detailed job response (for GET endpoints)
public record TranscriptionJobDetailResponse(
    Guid JobId,
    Guid MediaFileId,
    string OriginalFileName,
    TranscriptionJobStatus Status,
    TranscriptionQuality Quality,
    string? LanguageCode,
    string? Transcript,
    string? ErrorMessage,
    double? DurationSeconds,
    List<TranscriptSegmentDto> Segments,
    DateTime CreatedAtUtc,
    DateTime? StartedAtUtc,
    DateTime? CompletedAtUtc
);

// Segment DTO with timestamps
public record TranscriptSegmentDto(
    Guid Id,
    string Text,
    double StartSeconds,
    double EndSeconds,
    string? Speaker,
    int Order,
    bool IsEdited,
    string? OriginalText
);

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