using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Interfaces;

namespace ScribeApi.Infrastructure.Translation;

// Azure Translator implementation with batch support
public class AzureTranslationService : ITranslationService
{
    private readonly HttpClient _httpClient;
    private readonly TranslationSettings _settings;
    private readonly ILogger<AzureTranslationService> _logger;

    public AzureTranslationService(
        HttpClient httpClient,
        IOptions<TranslationSettings> settings,
        ILogger<AzureTranslationService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<List<string>> TranslateAsync(
        List<string> texts,
        string sourceLanguage,
        string targetLanguage,
        CancellationToken ct)
    {
        if (texts.Count == 0)
            return new List<string>();

        if (string.IsNullOrWhiteSpace(_settings.AzureApiKey))
            throw new InvalidOperationException("Azure Translator API key is not configured.");

        _logger.LogInformation("Translating {Count} texts from {Source} to {Target}",
            texts.Count, sourceLanguage, targetLanguage);

        // Azure Translator batch limit is 100 texts per request
        var results = new List<string>();
        var batches = texts.Chunk(100).ToList();

        foreach (var batch in batches)
        {
            var batchResults = await TranslateBatchAsync(batch.ToList(), sourceLanguage, targetLanguage, ct);
            results.AddRange(batchResults);
        }

        return results;
    }

    private async Task<List<string>> TranslateBatchAsync(
        List<string> texts,
        string sourceLanguage,
        string targetLanguage,
        CancellationToken ct)
    {
        var url = $"{_settings.AzureEndpoint}/translate?api-version=3.0&from={sourceLanguage}&to={targetLanguage}";

        var requestBody = texts.Select(t => new { Text = t }).ToList();
        var jsonContent = JsonSerializer.Serialize(requestBody);

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
        request.Headers.Add("Ocp-Apim-Subscription-Key", _settings.AzureApiKey);
        
        if (!string.IsNullOrWhiteSpace(_settings.AzureRegion))
            request.Headers.Add("Ocp-Apim-Subscription-Region", _settings.AzureRegion);

        var response = await _httpClient.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("Azure Translator failed: {Status} - {Error}", response.StatusCode, errorContent);
            throw new Exception($"Translation failed: {response.StatusCode} - {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync(ct);
        var translationResponse = JsonSerializer.Deserialize<List<AzureTranslationResponse>>(
            responseContent, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (translationResponse == null)
            throw new Exception("Failed to deserialize Azure Translator response.");

        return translationResponse
            .Select(r => r.Translations?.FirstOrDefault()?.Text ?? string.Empty)
            .ToList();
    }

    public Task<bool> IsLanguageSupportedAsync(string languageCode, CancellationToken ct)
    {
        // Azure supports 130+ languages - for simplicity, we accept all
        return Task.FromResult(!string.IsNullOrWhiteSpace(languageCode));
    }

    // Azure Translator response DTOs
    private class AzureTranslationResponse
    {
        public List<TranslationItem>? Translations { get; set; }
    }

    private class TranslationItem
    {
        public string? Text { get; set; }
        public string? To { get; set; }
    }
}
