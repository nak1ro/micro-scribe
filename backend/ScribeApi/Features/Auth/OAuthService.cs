using System.Text.Json;
using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using ScribeApi.Common.Configuration;
using ScribeApi.Common.Exceptions;

namespace ScribeApi.Features.Auth;

public class OAuthService : IOAuthService
{
    private const string GoogleProvider = "google";
    private const string GoogleTokenUrl = "https://oauth2.googleapis.com/token";
    private const string GrantTypeAuthorizationCode = "authorization_code";
    
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
                Provider: GoogleProvider,
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
        if (!provider.Equals(GoogleProvider, StringComparison.OrdinalIgnoreCase))
        {
            throw new OAuthException($"Unsupported OAuth provider: {provider}");
        }

        try
        {
            var tokenResponse = await SendTokenExchangeRequestAsync(code);
            return await ParseGoogleTokenResponseAsync(tokenResponse);
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

    private async Task<string> SendTokenExchangeRequestAsync(string code)
    {
        var tokenRequest = new Dictionary<string, string>
        {
            { "code", code },
            { "client_id", _oauthSettings.Google.ClientId },
            { "client_secret", _oauthSettings.Google.ClientSecret },
            { "redirect_uri", _oauthSettings.Google.RedirectUri },
            { "grant_type", GrantTypeAuthorizationCode }
        };

        var response = await _httpClient.PostAsync(
            GoogleTokenUrl,
            new FormUrlEncodedContent(tokenRequest)
        );

        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Failed to exchange code for token: {Error}", content);
            throw new OAuthException("Failed to exchange authorization code for access token");
        }

        return content;
    }

    private async Task<OAuthUserInfo> ParseGoogleTokenResponseAsync(string jsonResponse)
    {
        var tokenData = JsonSerializer.Deserialize<GoogleTokenResponse>(jsonResponse);

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
