namespace ScribeApi.Core.Configuration;

// Rate limiting configuration loaded from appsettings
public class RateLimitingSettings
{
    public const string SectionName = "RateLimiting";

    public bool EnableRateLimiting { get; set; } = true;
    public RateLimitTier GlobalLimits { get; set; } = new();
    public RateLimitTier AuthLimits { get; set; } = new();
    public RateLimitTier TranscriptionLimits { get; set; } = new();
    public RateLimitTier UploadLimits { get; set; } = new();
}

// Rate limit configuration for Free and Pro tiers
public class RateLimitTier
{
    public RateLimitConfig FreeTier { get; set; } = new();
    public RateLimitConfig ProTier { get; set; } = new();
}

// Individual rate limit configuration
public class RateLimitConfig
{
    public int PermitLimit { get; set; } = 100;
    public int WindowSeconds { get; set; } = 60;
}
