namespace ScribeApi.Core.Configuration;

public class YouTubeSettings
{
    public const string SectionName = "YouTube";

    public string ApiKey { get; set; } = string.Empty;
    public string ApplicationName { get; set; } = string.Empty;
}
