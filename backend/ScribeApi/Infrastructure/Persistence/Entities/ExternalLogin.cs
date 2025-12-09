namespace ScribeApi.Infrastructure.Persistence.Entities;

public class ExternalLogin
{
    public required string Id { get; set; }

    public required string UserId { get; set; }
    public required ApplicationUser User { get; set; }

    public required string Provider { get; set; } // "Microsoft", "Google", etc.

    public required string ProviderKey { get; set; } // sub/object id from provider

    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTimeOffset? AccessTokenExpiresAt { get; set; }
    public string? RawClaimsJson { get; set; }
}