using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Interfaces;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Transcription;

public class OpenAiTranscriptionProvider : ITranscriptionProvider
{
    private readonly HttpClient _httpClient;
    private readonly OpenAiSettings _settings;
    private readonly ILogger<OpenAiTranscriptionProvider> _logger;
    private const string WhisperUrl = "https://api.openai.com/v1/audio/transcriptions";

    public OpenAiTranscriptionProvider(
        HttpClient httpClient,
        IOptions<OpenAiSettings> settings,
        ILogger<OpenAiTranscriptionProvider> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<TranscriptionResult> TranscribeAsync(
        Stream audioStream,
        string fileName,
        TranscriptionQuality quality, 
        string? languageHint, 
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            throw new InvalidOperationException("OpenAI API Key is not configured.");
        }

        _logger.LogInformation("Starting OpenAI transcription for {FileName}. Language hint: {Language}", fileName, languageHint ?? "auto");

        using var request = new HttpRequestMessage(HttpMethod.Post, WhisperUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

        using var content = new MultipartFormDataContent();
        
        // Add file content
        var streamContent = new StreamContent(audioStream);
        // Basic MIME type inference (optional, but good practice if filename has extension)
        var contentType = "audio/mpeg"; 
        if (fileName.EndsWith(".wav")) contentType = "audio/wav";
        else if (fileName.EndsWith(".m4a")) contentType = "audio/mp4";
        
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        content.Add(streamContent, "file", fileName);

        // Add model
        content.Add(new StringContent("whisper-1"), "model");

        // Add response format to verbose_json to get segments
        content.Add(new StringContent("verbose_json"), "response_format");

        if (!string.IsNullOrWhiteSpace(languageHint))
        {
            content.Add(new StringContent(languageHint), "language");
        }

        request.Content = content;

        try
        {
            var response = await _httpClient.SendAsync(request, ct);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("OpenAI API failed. Status: {Status}, Error: {Error}", response.StatusCode, errorContent);
                throw new Exception($"OpenAI Transcription failed: {response.StatusCode} - {errorContent}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync(ct);
            var openAiResponse = JsonSerializer.Deserialize<OpenAiDtos.OpenAiWhisperResponse>(jsonResponse, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (openAiResponse == null)
            {
                throw new Exception("Failed to deserialize OpenAI response.");
            }

            return MapToResult(openAiResponse);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Error occurring during OpenAI transcription request");
            throw;
        }
    }

    private TranscriptionResult MapToResult(OpenAiDtos.OpenAiWhisperResponse response)
    {
        var segments = response.Segments?.Select(s => new TranscriptSegmentData(
            Text: s.Text,
            StartSeconds: s.Start,
            EndSeconds: s.End,
            Speaker: null // Whisper generic doesn't support diarization out of the box easily without add-ons
        )).ToList() ?? new List<TranscriptSegmentData>();

        // Whisper doesn't natively return chapters, so we might infer them or leave empty.
        // For now, empty list.
        var chapters = new List<TranscriptChapterData>();

        return new TranscriptionResult(
            FullTranscript: response.Text ?? string.Empty,
            DetectedLanguage: response.Language,
            Segments: segments,
            Chapters: chapters
        );
    }
}
