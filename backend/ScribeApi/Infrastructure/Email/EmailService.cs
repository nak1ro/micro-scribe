using System.Net;
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

    public async Task SendEmailConfirmationAsync(string email, string userId, string token, CancellationToken cancellationToken = default)
    {
        var subject = "Confirm your email";
        var encodedToken = WebUtility.UrlEncode(token);
        var encodedUserId = WebUtility.UrlEncode(userId);
        
        // Ensure ClientUrl has no trailing slash, but handle if user added it
        var baseUrl = _settings.ClientUrl.TrimEnd('/');
        var link = $"{baseUrl}/confirm-email?userId={encodedUserId}&token={encodedToken}";
        
        var body = $@"
            <h2>Confirm your email</h2>
            <p>Please confirm your email by clicking the link below:</p>
            <p><a href='{link}'>Confirm Email</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>{link}</p>";
            
        await SendEmailAsync(email, subject, body, cancellationToken);
    }

    public async Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken = default)
    {
        var subject = "Reset your password";
        var encodedToken = WebUtility.UrlEncode(token);
        var encodedEmail = WebUtility.UrlEncode(email);
        
        var baseUrl = _settings.ClientUrl.TrimEnd('/');
        // Assumes frontend route is /reset-password
        var link = $"{baseUrl}/reset-password?email={encodedEmail}&token={encodedToken}";
        
        var body = $@"
            <h2>Reset your password</h2>
            <p>Please reset your password by clicking the link below:</p>
            <p><a href='{link}'>Reset Password</a></p>";
            
        await SendEmailAsync(email, subject, body, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string email, string username, CancellationToken cancellationToken = default)
    {
        var subject = "Welcome to ScribeApi!";
        var body = $"<p>Welcome {username}! We are glad to have you with us.</p>";
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
            
            // Accept all SSL certificates (in case of self-signed in dev). 
            // ACS usually requires valid certs, so this callback might not be needed for prod but harmless if ACS cert relies on standard CA.
            // However, sticking to the previous implementation pattern for consistency, but ACS uses STARTTLS on 587.
            // client.ServerCertificateValidationCallback = (s, c, h, e) => true; 

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
            throw; 
        }
    }
}
