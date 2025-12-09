namespace ScribeApi.Common.Configuration;

public class OAuthSettings
{
    public GoogleOAuthSettings Google { get; set; } = new();
    public List<string> AllowedRedirectUris { get; set; } = new();
}

public class GoogleOAuthSettings
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
    public List<string> Scopes { get; set; } = new() { "openid", "profile", "email" };
}
