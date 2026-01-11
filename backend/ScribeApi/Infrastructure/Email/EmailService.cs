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
    private readonly IEmailSender _sender;

    public EmailService(ILogger<EmailService> logger, IOptions<EmailSettings> settings, IEmailSender sender)
    {
        _logger = logger;
        _settings = settings.Value;
        _sender = sender;
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
            
        await _sender.SendEmailAsync(email, subject, body, cancellationToken);
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
            
        await _sender.SendEmailAsync(email, subject, body, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string email, string username, CancellationToken cancellationToken = default)
    {
        var subject = "Welcome to ScribeApi!";
        var body = $"<p>Welcome {username}! We are glad to have you with us.</p>";
        await _sender.SendEmailAsync(email, subject, body, cancellationToken);
    }
}
