namespace ScribeApi.Features.Usage.Contracts;

public interface IUsageService
{
    Task<UsageResponse?> GetUsageAsync(string userId, CancellationToken ct);
}