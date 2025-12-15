namespace ScribeApi.Features.Transcriptions.Contracts
{
    public interface ITranscriptionJobService
    {
        Task<TranscriptionJobResponse> StartJobAsync(
            string userId,
            CreateTranscriptionJobRequest request,
            CancellationToken ct);

        Task CancelJobAsync(Guid jobId, string userId, CancellationToken ct);
    }
}