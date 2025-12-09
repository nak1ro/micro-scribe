using System.Text.Json;
using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using ScribeApi.Common.Configuration;
using ScribeApi.Common.Exceptions;

namespace ScribeApi.Features.Auth;

public class OAuthService : IOAuthService
{
    private readonly OAuthSettings _oauthSettings;
    private readonly HttpClient _httpClient;
    private readonly ILogger<OAuthService> _logger;

    public OAuthService(
        IOptions<OAuthSettings> oauthSettings,
        HttpClient httpClient,
        ILogger<OAuthService> logger)
    {
        _oauthSettings = oauthSettings.Value;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<OAuthUserInfo> ValidateGoogleTokenAsync(string idToken)
    {
        try
        {
            var validationSettings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _oauthSettings.Google.ClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, validationSettings);

            return new OAuthUserInfo(
                Provider: "google",
                ProviderKey: payload.Subject,
                Email: payload.Email,
                Name: payload.Name,
                AccessToken: null,
                RefreshToken: null,
                AccessTokenExpiresAt: null
            );
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning(ex, "Invalid Google ID token");
            throw new OAuthException("Invalid Google ID token", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating Google token");
            throw new OAuthException("Failed to validate Google token", ex);
        }
    }

    public async Task<OAuthUserInfo> ExchangeCodeForTokenAsync(string provider, string code)
    {
        if (!provider.Equals("google", StringComparison.OrdinalIgnoreCase))
        {
            throw new OAuthException($"Unsupported OAuth provider: {provider}");
        }

        try
        {
            // Exchange authorization code for access token
            var tokenRequest = new Dictionary<string, string>
            {
                { "code", code },
                { "client_id", _oauthSettings.Google.ClientId },
                { "client_secret", _oauthSettings.Google.ClientSecret },
                { "redirect_uri", _oauthSettings.Google.RedirectUri },
                { "grant_type", "authorization_code" }
            };

            var response = await _httpClient.PostAsync(
                "https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(tokenRequest)
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Failed to exchange code for token: {Error}", errorContent);
                throw new OAuthException("Failed to exchange authorization code for access token");
            }

            var tokenResponse = await response.Content.ReadAsStringAsync();
            var tokenData = JsonSerializer.Deserialize<GoogleTokenResponse>(tokenResponse);

            if (tokenData?.IdToken == null)
            {
                throw new OAuthException("No ID token returned from Google");
            }

            // Validate the ID token and extract user info
            var userInfo = await ValidateGoogleTokenAsync(tokenData.IdToken);

            // Update with access token and refresh token
            return userInfo with
            {
                AccessToken = tokenData.AccessToken,
                RefreshToken = tokenData.RefreshToken,
                AccessTokenExpiresAt = tokenData.ExpiresIn.HasValue
                    ? DateTimeOffset.UtcNow.AddSeconds(tokenData.ExpiresIn.Value)
                    : null
            };
        }
        catch (OAuthException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exchanging authorization code for token");
            throw new OAuthException("Failed to exchange authorization code", ex);
        }
    }

    private class GoogleTokenResponse
    {
        [System.Text.Json.Serialization.JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("expires_in")]
        public int? ExpiresIn { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("id_token")]
        public string? IdToken { get; set; }
    }
}
