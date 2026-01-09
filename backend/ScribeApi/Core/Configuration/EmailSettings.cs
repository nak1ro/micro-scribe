namespace ScribeApi.Core.Configuration;

public class EmailSettings
{
    public string ClientUrl { get; set; } = "http://localhost:3000";
    public string From { get; set; } = null!;
    public string SmtpServer { get; set; } = null!;
    public int Port { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
}