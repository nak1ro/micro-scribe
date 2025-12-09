namespace ScribeApi.Features.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request);
    Task ForgotPasswordAsync(ForgotPasswordRequestDto request);
    Task ResetPasswordAsync(ResetPasswordRequestDto request);
    Task ChangePasswordAsync(string userId, ChangePasswordRequestDto request);
    Task ConfirmEmailAsync(string userId, string token);
    Task RevokeTokenAsync(string userId);
    Task<AuthResponseDto> ExternalLoginAsync(ExternalAuthRequestDto request);
    Task<AuthResponseDto> OAuthCallbackAsync(OAuthCallbackRequestDto request);
    Task LinkExternalAccountAsync(string userId, LinkOAuthAccountRequestDto request);
    Task<List<ExternalLoginDto>> GetLinkedAccountsAsync(string userId);
    Task UnlinkExternalAccountAsync(string userId, string provider);
    Task<UserDto> GetUserByIdAsync(string userId);
}
