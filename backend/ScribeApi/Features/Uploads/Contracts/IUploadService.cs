namespace ScribeApi.Features.Uploads.Contracts;

public interface IUploadService
{
    Task<UploadSessionResponse> InitiateUploadAsync(InitiateUploadRequest request, string userId, CancellationToken ct);
    Task<UploadSessionStatusResponse> CompleteUploadAsync(Guid sessionId, CompleteUploadRequest request, string userId, CancellationToken ct);
    Task<UploadSessionStatusResponse> GetSessionStatusAsync(Guid sessionId, string userId, CancellationToken ct);
    Task AbortSessionAsync(Guid sessionId, string userId, CancellationToken ct);
}
