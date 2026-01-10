namespace ScribeApi.Features.Auth.Contracts;

public record RegisterRequestDto(string Email, string Password, string ConfirmPassword);

public record LoginRequestDto(string Email, string Password, bool RememberMe = false);



public record ForgotPasswordRequestDto(string Email);

public record ResendEmailConfirmationRequestDto(string Email);


public record ResetPasswordRequestDto(string Email, string Token, string NewPassword, string ConfirmNewPassword);

public record ChangePasswordRequestDto(string CurrentPassword, string NewPassword, string ConfirmNewPassword);

public record ExternalAuthRequestDto(string Provider, string IdToken);

public record OAuthCallbackRequestDto(string Provider, string Code, string? RedirectUri = null);

public record OAuthLoginRequestDto(string Provider, string IdToken);

public record LinkOAuthAccountRequestDto(string Provider, string IdToken);

// Internal DTO for OAuth user info
public record OAuthUserInfo(
    string Provider,
    string ProviderKey,
    string Email,
    string? Name,
    string? AccessToken = null,
    string? RefreshToken = null,
    DateTimeOffset? AccessTokenExpiresAt = null
);



public record UserDto
{
    public string Id { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public bool EmailConfirmed { get; init; }
    public List<string> Roles { get; init; } = new();
}

public record ExternalLoginDto(
    string Provider,
    string ProviderKey,
    DateTimeOffset? AccessTokenExpiresAt
);