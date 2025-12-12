namespace ScribeApi.Core.Configuration;

public class S3Settings
{
    public string BucketName { get; set; } = string.Empty;
    public string Region { get; set; } = "eu-central-1";
}