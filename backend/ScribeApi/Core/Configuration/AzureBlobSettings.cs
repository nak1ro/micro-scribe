namespace ScribeApi.Core.Configuration;

public class AzureBlobSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string ServiceUrl { get; set; } = string.Empty;
    public string ContainerName { get; set; } = string.Empty;
}
