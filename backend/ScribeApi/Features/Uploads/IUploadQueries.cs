using ScribeApi.Common.Configuration.Plans;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads;

public interface IUploadQueries
{
    Task<PlanDefinition> GetUserPlanDefinitionAsync(string userId, CancellationToken ct);
    Task<int> CountActiveSessionsAsync(string userId, CancellationToken ct);
    Task<UploadSession?> GetSessionAsync(Guid sessionId, string userId, CancellationToken ct);
}