using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Contracts;

public interface ITranscriptionJobQueries
{
    Task<int> CountActiveJobsAsync(string userId, CancellationToken ct);

    Task<MediaFile?> GetMediaFileByIdAsync(Guid mediaFileId, string userId, CancellationToken ct);

    Task<TranscriptionJob?> GetJobByIdAsync(Guid jobId, CancellationToken ct);

    Task<TranscriptionJob?> GetJobWithMediaAsync(Guid jobId, CancellationToken ct);

    Task<ApplicationUser?> GetUserByIdAsync(string userId, CancellationToken ct);
}