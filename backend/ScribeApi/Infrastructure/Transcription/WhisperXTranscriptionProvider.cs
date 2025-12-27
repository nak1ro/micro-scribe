using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Interfaces;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Transcription;

// WhisperX transcription provider for local/self-hosted WhisperX server
public class WhisperXTranscriptionProvider : ITranscriptionProvider
{
    private readonly HttpClient _httpClient;
    private readonly WhisperXSettings _settings;
    private readonly ILogger<WhisperXTranscriptionProvider> _logger;

    public WhisperXTranscriptionProvider(
        HttpClient httpClient,
        IOptions<WhisperXSettings> settings,
        ILogger<WhisperXTranscriptionProvider> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;

        _httpClient.Timeout = TimeSpan.FromMinutes(30);
    }

    public async Task<TranscriptionResult> TranscribeAsync(
        Stream audioStream,
        string fileName,
        TranscriptionQuality quality,
        string? languageHint,
        bool enableSpeakerDiarization,
        CancellationToken ct)
    {
        var url = $"{_settings.BaseUrl.TrimEnd('/')}/transcribe";

        _logger.LogInformation("Sending transcription request to WhisperX at {Url}. File: {FileName}, Quality: {Quality}, Diarization: {Diarization}",
            url, fileName, quality, enableSpeakerDiarization);

        // Buffer stream into memory for multipart upload
        using var memoryStream = new MemoryStream();
        await audioStream.CopyToAsync(memoryStream, ct);
        memoryStream.Position = 0;

        using var content = new MultipartFormDataContent();

        // Add file
        var fileContent = new StreamContent(memoryStream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(GetContentType(fileName));
        content.Add(fileContent, "file", fileName);

        // Add quality parameter
        var qualityValue = quality switch
        {
            TranscriptionQuality.Fast => "fast",
            TranscriptionQuality.Balanced => "balanced",
            TranscriptionQuality.Accurate => "accurate",
            _ => "balanced"
        };
        content.Add(new StringContent(qualityValue), "quality");

        // Add language hint if provided (null = auto-detect)
        if (!string.IsNullOrWhiteSpace(languageHint))
        {
            content.Add(new StringContent(languageHint), "language");
        }

        // Add diarization flag
        content.Add(new StringContent(enableSpeakerDiarization.ToString().ToLower()), "enable_diarization");

        try
        {
            var response = await _httpClient.PostAsync(url, content, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("WhisperX failed: {Status} - {Error}", response.StatusCode, errorContent);
                throw new Exception($"WhisperX transcription failed: {response.StatusCode} - {errorContent}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync(ct);
            var whisperResponse = JsonSerializer.Deserialize<WhisperXResponse>(jsonResponse, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (whisperResponse == null)
                throw new Exception("Failed to deserialize WhisperX response.");

            _logger.LogInformation("WhisperX completed. Language: {Lang}, Segments: {Count}",
                whisperResponse.DetectedLanguage, whisperResponse.Segments?.Count ?? 0);

            return MapToResult(whisperResponse);
        }
        catch (TaskCanceledException ex) when (!ct.IsCancellationRequested)
        {
            _logger.LogError(ex, "WhisperX request timed out");
            throw new Exception("WhisperX request timed out. The file may be too large.", ex);
        }
    }

    private static string GetContentType(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".m4a" => "audio/mp4",
            ".webm" => "audio/webm",
            ".ogg" => "audio/ogg",
            ".flac" => "audio/flac",
            _ => "audio/mpeg"
        };
    }

    private static TranscriptionResult MapToResult(WhisperXResponse response)
    {
        var segments = response.Segments?.Select(s => new TranscriptSegmentData(
            Text: s.Text?.Trim() ?? string.Empty,
            StartSeconds: s.StartSeconds,
            EndSeconds: s.EndSeconds,
            Speaker: s.Speaker
        )).ToList() ?? new List<TranscriptSegmentData>();

        return new TranscriptionResult(
            FullTranscript: response.FullTranscript ?? string.Empty,
            DetectedLanguage: response.DetectedLanguage,
            Segments: segments,
            Chapters: new List<TranscriptChapterData>()
        );
    }

    // Response DTOs matching the FastAPI server format
    private class WhisperXResponse
    {
        public string? FullTranscript { get; set; }
        public string? DetectedLanguage { get; set; }
        public List<WhisperXSegment>? Segments { get; set; }
    }

    private class WhisperXSegment
    {
        public string? Text { get; set; }
        public double StartSeconds { get; set; }
        public double EndSeconds { get; set; }
        public string? Speaker { get; set; }
    }
}
