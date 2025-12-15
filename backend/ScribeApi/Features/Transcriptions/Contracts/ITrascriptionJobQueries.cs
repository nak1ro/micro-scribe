using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Contracts
{
    public interface ITranscriptionJobQueries
    {
        Task<int> CountActiveJobsAsync(string userId, CancellationToken ct);

        Task<int> CountDailyJobsAsync(string userId, DateTime dateUtc, CancellationToken ct);

        Task<bool> HasPendingJobForMediaAsync(Guid mediaFileId, string userId, CancellationToken ct);

        Task<MediaFile?> GetMediaFileByIdAsync(Guid mediaFileId, string userId, CancellationToken ct);

        Task<TranscriptionJob?> GetJobByIdAsync(Guid jobId, CancellationToken ct);

        Task<TranscriptionJob?> GetJobWithMediaAsync(Guid jobId, CancellationToken ct);

        Task<TranscriptionJob?> GetJobWithSegmentsAsync(Guid jobId, CancellationToken ct);

        Task<ApplicationUser?> GetUserByIdAsync(string userId, CancellationToken ct);

        Task<(List<TranscriptionJob> Items, int TotalCount)> GetUserJobsAsync(
            string userId, int page, int pageSize, CancellationToken ct);
    }
}