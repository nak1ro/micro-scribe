using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Contracts;

// Request to start a transcription job
public record CreateTranscriptionJobRequest(
    Guid MediaFileId,
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
    DateTime CreatedAtUtc,
    DateTime? StartedAtUtc,
    DateTime? CompletedAtUtc
);