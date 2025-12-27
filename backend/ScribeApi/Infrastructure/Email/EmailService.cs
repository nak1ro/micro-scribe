using ScribeApi.Core.Interfaces;
using ScribeApi.Core.Configuration;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace ScribeApi.Infrastructure.Email;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly EmailSettings _settings;

    public EmailService(ILogger<EmailService> logger, IOptions<EmailSettings> settings)
    {
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task SendEmailConfirmationAsync(string email, string token, CancellationToken cancellationToken = default)
    {
        var subject = "Confirm your email";
        var body = $"Please confirm your email by using this token: {token}";
        await SendEmailAsync(email, subject, body, cancellationToken);
    }

    public async Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken = default)
    {
        var subject = "Reset your password";
        var body = $"Please reset your password by using this token: {token}";
        await SendEmailAsync(email, subject, body, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string email, string username, CancellationToken cancellationToken = default)
    {
        var subject = "Welcome to ScribeApi!";
        var body = $"Welcome {username}! We are glad to have you with us.";
        await SendEmailAsync(email, subject, body, cancellationToken);
    }

    private async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("ScribeApi", _settings.From));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            message.Body = new TextPart("html")
            {
                Text = body
            };

            using var client = new SmtpClient();
            
            // Accept all SSL certificates (in case of self-signed in dev)
            // In production, you might want to validate the certificate.
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;

            await client.ConnectAsync(_settings.SmtpServer, _settings.Port, SecureSocketOptions.StartTls, cancellationToken);

            if (!string.IsNullOrEmpty(_settings.Username) && !string.IsNullOrEmpty(_settings.Password))
            {
                await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
            
            _logger.LogInformation("Email sent successfully to {Email}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", to);
            // We might not want to throw the exception up if email sending is non-critical, 
            // but for core auth flows, failure to send might be critical.
            // For now, logging it. logic can be adjusted based on requirements.
            throw; 
        }
    }
}
