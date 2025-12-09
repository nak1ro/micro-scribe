namespace ScribeApi.Features.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken = default);
    Task ForgotPasswordAsync(ForgotPasswordRequestDto request, CancellationToken cancellationToken = default);
    Task ResetPasswordAsync(ResetPasswordRequestDto request, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(string userId, ChangePasswordRequestDto request, CancellationToken cancellationToken = default);
    Task ConfirmEmailAsync(string userId, string token, CancellationToken cancellationToken = default);
    Task RevokeTokenAsync(string userId, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> ExternalLoginAsync(ExternalAuthRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> OAuthCallbackAsync(OAuthCallbackRequestDto request, CancellationToken cancellationToken = default);
    Task LinkExternalAccountAsync(string userId, LinkOAuthAccountRequestDto request, CancellationToken cancellationToken = default);
    Task<List<ExternalLoginDto>> GetLinkedAccountsAsync(string userId, CancellationToken cancellationToken = default);
    Task UnlinkExternalAccountAsync(string userId, string provider, CancellationToken cancellationToken = default);
    Task<UserDto> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default);
}
