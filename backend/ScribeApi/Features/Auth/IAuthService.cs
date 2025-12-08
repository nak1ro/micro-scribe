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
    Task<UserDto> GetUserByIdAsync(string userId);
}
