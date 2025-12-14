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
    private const long MaxFileSizeBytes = 25 * 1024 * 1024; // OpenAI Whisper limit: 25MB

    public OpenAiTranscriptionProvider(
        HttpClient httpClient,
        IOptions<OpenAiSettings> settings,
        ILogger<OpenAiTranscriptionProvider> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
        
        // Set a longer timeout for large files
        _httpClient.Timeout = TimeSpan.FromMinutes(10);
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

        // Buffer the stream into memory - S3 streams aren't seekable and chunked uploads can fail
        _logger.LogDebug("Buffering audio stream into memory for reliable upload...");
        using var memoryStream = new MemoryStream();
        await audioStream.CopyToAsync(memoryStream, ct);
        memoryStream.Position = 0;
        
        var fileSizeBytes = memoryStream.Length;
        var fileSizeMB = fileSizeBytes / (1024.0 * 1024.0);
        
        _logger.LogInformation("Starting OpenAI transcription for {FileName}. Size: {Size:F2} MB, Language: {Language}", 
            fileName, fileSizeMB, languageHint ?? "auto");

        // Check file size limit
        if (fileSizeBytes > MaxFileSizeBytes)
        {
            throw new InvalidOperationException(
                $"Audio file is too large for OpenAI Whisper API: {fileSizeMB:F2} MB (max: 25 MB). " +
                "Consider using a lower quality or splitting the file.");
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, WhisperUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

        using var content = new MultipartFormDataContent();
        
        // Add file content from buffered memory stream
        var streamContent = new StreamContent(memoryStream);
        streamContent.Headers.ContentLength = fileSizeBytes; // Set explicit content length
        
        // MIME type inference
        var contentType = "audio/mpeg"; 
        if (fileName.EndsWith(".wav", StringComparison.OrdinalIgnoreCase)) contentType = "audio/wav";
        else if (fileName.EndsWith(".m4a", StringComparison.OrdinalIgnoreCase)) contentType = "audio/mp4";
        else if (fileName.EndsWith(".mp3", StringComparison.OrdinalIgnoreCase)) contentType = "audio/mpeg";
        else if (fileName.EndsWith(".webm", StringComparison.OrdinalIgnoreCase)) contentType = "audio/webm";
        
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
            _logger.LogDebug("Sending request to OpenAI Whisper API...");
            var response = await _httpClient.SendAsync(request, ct);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("OpenAI API failed. Status: {Status}, Error: {Error}", response.StatusCode, errorContent);
                throw new Exception($"OpenAI Transcription failed: {response.StatusCode} - {errorContent}");
            }

            _logger.LogDebug("OpenAI request successful, parsing response...");
            var jsonResponse = await response.Content.ReadAsStringAsync(ct);
            var openAiResponse = JsonSerializer.Deserialize<OpenAiDtos.OpenAiWhisperResponse>(jsonResponse, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (openAiResponse == null)
            {
                throw new Exception("Failed to deserialize OpenAI response.");
            }

            _logger.LogInformation("OpenAI transcription completed. Detected language: {Lang}, Segments: {Count}", 
                openAiResponse.Language, openAiResponse.Segments?.Count ?? 0);

            return MapToResult(openAiResponse);
        }
        catch (TaskCanceledException ex) when (!ct.IsCancellationRequested)
        {
            _logger.LogError(ex, "OpenAI request timed out. File size: {Size:F2} MB", fileSizeMB);
            throw new Exception($"OpenAI request timed out. The file ({fileSizeMB:F2} MB) may be too large or the connection is slow.", ex);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Error during OpenAI transcription request. File: {FileName}, Size: {Size:F2} MB", fileName, fileSizeMB);
            throw;
        }
    }

    private TranscriptionResult MapToResult(OpenAiDtos.OpenAiWhisperResponse response)
    {
        var segments = response.Segments?.Select(s => new TranscriptSegmentData(
            Text: s.Text,
            StartSeconds: s.Start,
            EndSeconds: s.End,
            Speaker: null
        )).ToList() ?? new List<TranscriptSegmentData>();

        var chapters = new List<TranscriptChapterData>();

        return new TranscriptionResult(
            FullTranscript: response.Text ?? string.Empty,
            DetectedLanguage: response.Language,
            Segments: segments,
            Chapters: chapters
        );
    }
}
