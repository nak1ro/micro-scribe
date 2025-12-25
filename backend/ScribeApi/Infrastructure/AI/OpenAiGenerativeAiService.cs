using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Interfaces;
using ScribeApi.Infrastructure.Transcription; // For OpenAiDtos

namespace ScribeApi.Infrastructure.AI;

public class OpenAiGenerativeAiService : IGenerativeAiService
{
    private readonly HttpClient _httpClient;
    private readonly OpenAiSettings _settings;
    private readonly ILogger<OpenAiGenerativeAiService> _logger;
    private const string ChatCompletionsUrl = "https://api.openai.com/v1/chat/completions";

    public OpenAiGenerativeAiService(
        HttpClient httpClient,
        IOptions<OpenAiSettings> settings,
        ILogger<OpenAiGenerativeAiService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
        _httpClient.Timeout = TimeSpan.FromSeconds(60); // 60s timeout for generation
    }

    public async Task<string> GenerateTextAsync(string prompt, string contextContent, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            throw new InvalidOperationException("OpenAI API Key not configured.");

        // Construct the messages
        var messages = new List<OpenAiDtos.ChatMessage>
        {
            new() { Role = "system", Content = prompt },
            new() { Role = "user", Content = contextContent }
        };

        var requestBody = new OpenAiDtos.ChatCompletionRequest
        {
            Model = "gpt-4o-mini", // Cost efficient model
            Messages = messages,
            Temperature = 0.5 
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, ChatCompletionsUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);
        request.Content = JsonContent.Create(requestBody);

        try
        {
            var response = await _httpClient.SendAsync(request, ct);
            
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("OpenAI Chat Completion failed. Status: {Status}, Error: {Error}", response.StatusCode, error);
                throw new Exception($"AI Generation failed: {response.StatusCode}");
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            var result = JsonSerializer.Deserialize<OpenAiDtos.ChatCompletionResponse>(json);

            var content = result?.Choices?.FirstOrDefault()?.Message?.Content;
            if (string.IsNullOrEmpty(content))
                throw new Exception("AI returned empty content.");

            return content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling OpenAI Chat API");
            throw;
        }
    }
}
