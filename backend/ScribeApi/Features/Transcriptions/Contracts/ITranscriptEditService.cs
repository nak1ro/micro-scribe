using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Services;

public interface ITranscriptEditService
{
    Task<TranscriptSegmentDto> UpdateSegmentAsync(Guid jobId, Guid segmentId, string userId, UpdateSegmentRequest request, CancellationToken ct);
    Task<TranscriptSegmentDto> RevertSegmentAsync(Guid jobId, Guid segmentId, string userId, CancellationToken ct);
}
