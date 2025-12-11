using System.Text.Json.Serialization;

namespace ScribeApi.Infrastructure.Transcription;

public class OpenAiDtos
{
    public record OpenAiWhisperResponse
    {
        [JsonPropertyName("text")]
        public string? Text { get; set; }

        [JsonPropertyName("language")]
        public string? Language { get; set; }

        [JsonPropertyName("duration")]
        public double Duration { get; set; }

        [JsonPropertyName("segments")]
        public List<OpenAiSegment>? Segments { get; set; }
    }

    public record OpenAiSegment
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("start")]
        public double Start { get; set; }

        [JsonPropertyName("end")]
        public double End { get; set; }

        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;
    }
}