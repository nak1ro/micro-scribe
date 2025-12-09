using System.Collections.Generic;
using System.Threading.Tasks;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Auth;

public interface IAuthQueries
{
    Task<RefreshToken?> GetRefreshTokenByTokenAsync(string token);
    Task<List<RefreshToken>> GetRefreshTokensByUserIdAsync(string userId);
    Task<ExternalLogin?> GetExternalLoginAsync(string provider, string key);
    Task<List<ExternalLogin>> GetExternalLoginsByUserIdAsync(string userId);
    Task<ExternalLogin?> GetExternalLoginByProviderAsync(string userId, string provider);
    Task<int> CountOtherExternalLoginsAsync(string userId, string provider);
}
