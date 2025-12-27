namespace ScribeApi.Core.Configuration;

// Configuration for WhisperX local server
public class WhisperXSettings
{
    // Base URL for the WhisperX FastAPI server
    public string BaseUrl { get; set; } = "http://localhost:8000";
}
