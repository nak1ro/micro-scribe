namespace ScribeApi.Infrastructure.ExternalServices;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailConfirmationAsync(string email, string token, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Sending email confirmation to {Email} with token {Token}", email, token);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Sending password reset to {Email} with token {Token}", email, token);
        return Task.CompletedTask;
    }

    public Task SendWelcomeEmailAsync(string email, string username, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Sending welcome email to {Email} ({Username})", email, username);
        return Task.CompletedTask;
    }
}
