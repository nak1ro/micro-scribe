namespace ScribeApi.Core.Configuration;

// Configuration for translation services
public class TranslationSettings
{
    // Provider: "Azure", "DeepL", etc.
    public string Provider { get; set; } = "Azure";
    
    // Azure Translator settings
    public string? AzureEndpoint { get; set; } = "https://api.cognitive.microsofttranslator.com";
    public string? AzureApiKey { get; set; }
    public string? AzureRegion { get; set; }
    
    // DeepL settings (for future use)
    public string? DeepLApiKey { get; set; }
}
