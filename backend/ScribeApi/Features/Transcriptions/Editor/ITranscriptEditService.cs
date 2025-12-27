using ScribeApi.Features.Transcriptions.Contracts;

namespace ScribeApi.Features.Transcriptions.Editor;

public interface ITranscriptEditService
{
    Task<TranscriptSegmentDto> UpdateSegmentAsync(Guid jobId, Guid segmentId, string userId, UpdateSegmentRequest request, CancellationToken ct);
    Task<TranscriptSegmentDto> RevertSegmentAsync(Guid jobId, Guid segmentId, string userId, CancellationToken ct);
}
