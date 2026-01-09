using System.Text.Json;
using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Exceptions;
using ScribeApi.Features.Auth.Contracts;

namespace ScribeApi.Features.Auth.Services;

public class OAuthService : IOAuthService
{
    private const string GoogleProvider = AuthConstants.Providers.Google;
    private const string GoogleTokenUrl = "https://oauth2.googleapis.com/token";
    
    private const string MicrosoftProvider = AuthConstants.Providers.Microsoft;
    private const string MicrosoftTokenUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
    private const string MicrosoftGraphStatsUrl = "https://graph.microsoft.com/v1.0/me";

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

    public async Task<OAuthUserInfo> ValidateGoogleTokenAsync(string idToken, CancellationToken cancellationToken = default)
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

    public async Task<OAuthUserInfo> ValidateMicrosoftTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        // For Microsoft, 'token' could be an Access Token (if obtained via Code flow or Implicit flow for API)
        // or an ID Token.
        // If it's an Access Token, we can call Graph API to get user info.
        // If it's an ID Token, we should validate signature.
        
        // This implementation assumes we are validating a token by calling Graph API (Me endpoint).
        // This is safer as it verifies the token is active and valid for the user.
        // This works best if the token passed is an Access Token.
        
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, MicrosoftGraphStatsUrl);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            
            var response = await _httpClient.SendAsync(request, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Failed to validate Microsoft token via Graph API: {Error}", errorContent);
                throw new OAuthException("Invalid Microsoft token.");
            }
            
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var graphUser = JsonSerializer.Deserialize<MicrosoftGraphUser>(content);
            
            if (graphUser == null || string.IsNullOrEmpty(graphUser.Id) || string.IsNullOrEmpty(graphUser.Email))
            {
                 throw new OAuthException("Could not retrieve user info from Microsoft Graph.");
            }
            
            return new OAuthUserInfo(
                Provider: MicrosoftProvider,
                ProviderKey: graphUser.Id,
                Email: graphUser.Email, // Note: 'mail' or 'userPrincipalName'
                Name: graphUser.DisplayName,
                AccessToken: token, // We are validating this token, so it counts? Or maybe not. 
                // Context: If this was called from "ExternalLogin", the client sent us a token.
                // We don't necessarily have refresh token here unless passed.
                RefreshToken: null, 
                AccessTokenExpiresAt: null 
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating Microsoft token");
            throw new OAuthException("Failed to validate Microsoft token", ex);
        }
    }

    public async Task<OAuthUserInfo> ExchangeCodeForTokenAsync(string provider, string code, CancellationToken cancellationToken = default)
    {
        if (provider.Equals(GoogleProvider, StringComparison.OrdinalIgnoreCase))
        {
             var tokenResponse = await SendGoogleTokenExchangeRequestAsync(code, cancellationToken);
             return await ParseGoogleTokenResponseAsync(tokenResponse, cancellationToken);
        }
        
        if (provider.Equals(MicrosoftProvider, StringComparison.OrdinalIgnoreCase))
        {
            var tokenResponse = await SendMicrosoftTokenExchangeRequestAsync(code, cancellationToken);
            return await ParseMicrosoftTokenResponseAsync(tokenResponse, cancellationToken);
        }

        throw new OAuthException($"Unsupported OAuth provider: {provider}");


    }

    private async Task<string> SendGoogleTokenExchangeRequestAsync(string code, CancellationToken cancellationToken)
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
            new FormUrlEncodedContent(tokenRequest),
            cancellationToken
        );

        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (response.IsSuccessStatusCode) return content;
        
        _logger.LogWarning("Failed to exchange code for token: {Error}", content);
        throw new OAuthException("Failed to exchange authorization code for access token");
    }

    private async Task<string> SendMicrosoftTokenExchangeRequestAsync(string code, CancellationToken cancellationToken)
    {
        var tokenRequest = new Dictionary<string, string>
        {
            { "client_id", _oauthSettings.Microsoft.ClientId },
            { "scope", string.Join(" ", _oauthSettings.Microsoft.Scopes) },
            { "code", code },
            { "redirect_uri", _oauthSettings.Microsoft.RedirectUri },
            { "grant_type", GrantTypeAuthorizationCode },
            { "client_secret", _oauthSettings.Microsoft.ClientSecret }
        };

        var response = await _httpClient.PostAsync(
            MicrosoftTokenUrl,
            new FormUrlEncodedContent(tokenRequest),
            cancellationToken
        );

        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (response.IsSuccessStatusCode) return content;
        
        _logger.LogWarning("Failed to exchange Microsoft code for token: {Error}", content);
        throw new OAuthException($"Failed to exchange authorization code for access token: {content}");
    }

    private async Task<OAuthUserInfo> ParseMicrosoftTokenResponseAsync(string jsonResponse, CancellationToken cancellationToken)
    {
        var tokenData = JsonSerializer.Deserialize<MicrosoftTokenResponse>(jsonResponse);
        
        if (string.IsNullOrEmpty(tokenData?.AccessToken))
        {
             throw new OAuthException("No Access Token returned from Microsoft");
        }
        
        // With Microsoft, we need to call Graph API to get the user ID/Email because the ID Token 
        // returned in the Token Response might be encrypted or we just want to be sure.
        // BUT, usually a Code Exchange returns an ID Token too.
        // Let's rely on calling Graph API with the Access Token for simplicity and correctness.
        
        var userInfo = await ValidateMicrosoftTokenAsync(tokenData.AccessToken, cancellationToken);

        return userInfo with
        {
            AccessToken = tokenData.AccessToken,
            RefreshToken = tokenData.RefreshToken,
            AccessTokenExpiresAt = tokenData.ExpiresIn.HasValue
                ? DateTimeOffset.UtcNow.AddSeconds(tokenData.ExpiresIn.Value)
                : null
        };
    }

    private async Task<OAuthUserInfo> ParseGoogleTokenResponseAsync(string jsonResponse, CancellationToken cancellationToken)
    {
        var tokenData = JsonSerializer.Deserialize<GoogleTokenResponse>(jsonResponse);

        if (tokenData?.IdToken == null)
        {
            throw new OAuthException("No ID token returned from Google");
        }

        // Validate the ID token and extract user info
        var userInfo = await ValidateGoogleTokenAsync(tokenData.IdToken, cancellationToken);

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

    private class MicrosoftTokenResponse
    {
        [System.Text.Json.Serialization.JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("expires_in")]
        public int? ExpiresIn { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; set; }
       
       // Microsoft also returns scope, token_type, etc.
    }

    private class MicrosoftGraphUser
    {
        [System.Text.Json.Serialization.JsonPropertyName("id")]
        public string? Id { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("displayName")]
        public string? DisplayName { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("mail")]
        public string? Mail { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("userPrincipalName")]
        public string? UserPrincipalName { get; set; }
        
        public string? Email => !string.IsNullOrEmpty(Mail) ? Mail : UserPrincipalName;
    }
}