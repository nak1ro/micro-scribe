using System.Net;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Interfaces;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace ScribeApi.Infrastructure.Email;

public class SmtpEmailSender : IEmailSender
{
    private readonly ILogger<SmtpEmailSender> _logger;
    private readonly EmailSettings _settings;

    public SmtpEmailSender(ILogger<SmtpEmailSender> logger, IOptions<EmailSettings> settings)
    {
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
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
            // client.ServerCertificateValidationCallback = (s, c, h, e) => true; 

            await client.ConnectAsync(_settings.SmtpServer, _settings.Port, SecureSocketOptions.Auto, cancellationToken);

            if (!string.IsNullOrEmpty(_settings.Username) && !string.IsNullOrEmpty(_settings.Password))
            {
                await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
            
            _logger.LogInformation("SMTP Email sent successfully to {Email}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMTP email to {Email}", to);
            throw; 
        }
    }
}
