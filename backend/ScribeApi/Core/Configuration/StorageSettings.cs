namespace ScribeApi.Core.Configuration;

public class StorageSettings
{
    public string Provider { get; set; } = "Local";
    public int PresignedUrlExpiryMinutes { get; set; } = 60;
    public int MultipartThresholdBytes { get; set; } = 200 * 1024 * 1024;
    public int PartSizeBytes { get; set; } = 50 * 1024 * 1024;
}
