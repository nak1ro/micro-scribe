namespace ScribeApi.Core.Configuration;

public class S3Settings
{
    public string BucketName { get; set; } = string.Empty;
    public string Region { get; set; } = "eu-central-1";
    public string? AccessKeyId { get; set; }
    public string? SecretAccessKey { get; set; }
}