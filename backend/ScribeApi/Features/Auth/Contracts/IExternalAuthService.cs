using ScribeApi.Features.Auth.Contracts;

namespace ScribeApi.Features.Auth.Contracts;

public interface IExternalAuthService
{
    Task<UserDto> ExternalLoginAsync(ExternalAuthRequestDto request, CancellationToken cancellationToken = default);
    Task<UserDto> OAuthCallbackAsync(OAuthCallbackRequestDto request, CancellationToken cancellationToken = default);
    Task LinkExternalAccountAsync(string userId, LinkOAuthAccountRequestDto request, CancellationToken cancellationToken = default);
    Task UnlinkExternalAccountAsync(string userId, string provider, CancellationToken cancellationToken = default);
    Task<List<ExternalLoginDto>> GetLinkedAccountsAsync(string userId, CancellationToken cancellationToken = default);
}
