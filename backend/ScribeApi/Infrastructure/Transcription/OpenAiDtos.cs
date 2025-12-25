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

    // Chat Completion DTOs
    public record ChatCompletionRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = "gpt-4o-mini";

        [JsonPropertyName("messages")]
        public List<ChatMessage> Messages { get; set; } = new();

        [JsonPropertyName("temperature")]
        public double Temperature { get; set; } = 0.7;
    }

    public record ChatMessage
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = "user";

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;
    }

    public record ChatCompletionResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("choices")]
        public List<ChatChoice> Choices { get; set; } = new();

        [JsonPropertyName("model")]
        public string Model { get; set; } = string.Empty;
    }

    public record ChatChoice
    {
        [JsonPropertyName("message")]
        public ChatMessage Message { get; set; } = new();

        [JsonPropertyName("finish_reason")]
        public string FinishReason { get; set; } = string.Empty;
    }
}