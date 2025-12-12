namespace ScribeApi.Infrastructure.Persistence.Entities;

public class ExternalLogin
{
    // Unique identifier
    public required string Id { get; set; }

    // FK to ApplicationUser
    public required string UserId { get; set; }

    // OAuth provider name (e.g. "Microsoft", "Google")
    public required string Provider { get; set; }

    // Subject/object ID from the OAuth provider
    public required string ProviderKey { get; set; }

    // OAuth access token
    public string? AccessToken { get; set; }

    // OAuth refresh token
    public string? RefreshToken { get; set; }

    // When the access token expires
    public DateTimeOffset? AccessTokenExpiresAt { get; set; }

    // Raw JSON claims from the provider
    public string? RawClaimsJson { get; set; }

    // Nav
    public required ApplicationUser User { get; set; }
}