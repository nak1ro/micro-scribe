using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Auth.Contracts;

public interface IAuthQueries
{

    Task<ExternalLogin?> GetExternalLoginAsync(string provider, string key, CancellationToken cancellationToken = default);
    Task<List<ExternalLogin>> GetExternalLoginsByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<ExternalLogin?> GetExternalLoginByProviderAsync(string userId, string provider, CancellationToken cancellationToken = default);
    Task<int> CountOtherExternalLoginsAsync(string userId, string provider, CancellationToken cancellationToken = default);
}
