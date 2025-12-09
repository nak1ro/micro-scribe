using System.ComponentModel.DataAnnotations;

namespace ScribeApi.Features.Auth;

public record RegisterRequestDto(string Email, string Password, string ConfirmPassword);

public record LoginRequestDto(string Email, string Password);

public record RefreshTokenRequestDto(string RefreshToken);

public record ForgotPasswordRequestDto(string Email);

public record ResetPasswordRequestDto(string Email, string Token, string NewPassword, string ConfirmNewPassword);

public record ChangePasswordRequestDto(string CurrentPassword, string NewPassword, string ConfirmNewPassword);

public record ExternalAuthRequestDto(string Provider, string IdToken);

public record AuthResponseDto(string AccessToken, string RefreshToken, int ExpiresIn, string TokenType, UserDto User);

public record UserDto
{
    public string Id { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public bool EmailConfirmed { get; init; }
    public List<string> Roles { get; init; } = new();
}