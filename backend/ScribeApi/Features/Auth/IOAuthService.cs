namespace ScribeApi.Features.Auth;

public interface IOAuthService
{
    // Validates a Google ID token and extracts user information
    Task<OAuthUserInfo> ValidateGoogleTokenAsync(string idToken);
    
    // Exchanges an authorization code for access tokens (for server-side flow)
    Task<OAuthUserInfo> ExchangeCodeForTokenAsync(string provider, string code);
}
