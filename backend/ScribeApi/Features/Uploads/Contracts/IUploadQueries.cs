using ScribeApi.Common.Configuration.Plans;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads.Contracts;

public interface IUploadQueries
{
    Task<PlanType> GetUserPlanTypeAsync(string userId, CancellationToken ct);
    Task<int> CountActiveSessionsAsync(string userId, CancellationToken ct);
    Task<UploadSession?> GetSessionAsync(Guid sessionId, string userId, CancellationToken ct);
    Task<int> CountDailyUploadsAsync(string userId, DateTime dateUtc, CancellationToken ct);
}