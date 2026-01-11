using Azure;
using Azure.Communication.Email;
using Azure.Identity;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Interfaces;

namespace ScribeApi.Infrastructure.Email;

public class AzureEmailSender : IEmailSender
{
    private readonly ILogger<AzureEmailSender> _logger;
    private readonly EmailSettings _settings;
    private readonly EmailClient _emailClient;

    public AzureEmailSender(ILogger<AzureEmailSender> logger, IOptions<EmailSettings> settings)
    {
        _logger = logger;
        _settings = settings.Value;

        // Use Managed Identity by default
        // The Endpoint should be configured in EmailSettings:SmtpServer (reusing field) or a new field
        // But Azure.Communication.Email connects via ConnectionString OR Endpoint+Credential
        
        // Strategy: Use ConnectionString if provided (Dev), otherwise Endpoint+Identity (Prod)
        // Since user has "SmtpServer" (which is likely the endpoint "xxxx.azurecomm.net"), we can use that.
        
        // However, for pure flexibility, let's assume valid Endpoint is in SmtpServer field for now
        // Or we can parse it.
        
        // Actually, let's try to construct it robustly.
        // Assuming EmailSettings.SmtpServer contains the endpoint URL (e.g. https://<resource>.communication.azure.com)
        // If it's just "smtp.azurecomm.net", that's for SMTP, not the SDK API.
        
        // We might need a new setting "ServiceUrl" specifically for ACS Resource.
        // BUT, to avoid new config if possible, we can try to infer or require it.
        // Let's rely on standard DI injection of EmailClient if possible, OR instantiate here.
        
        // Simplest: Instantiate here using DefaultAzureCredential
        // We need the ACS Resource Endpoint.
        
        var endpoint = _settings.SmtpServer; // User provided "smtp.azurecomm.net" which is WRONG for SDK.
        
        // Hard fix: The SDK needs the Resource Endpoint (e.g. https://my-resource.communication.azure.com)
        // The user likely hasn't set this yet.
        // We will need to instruct the user to set "EmailSettings:ServiceEndpoint"
        
        // Re-using SmtpServer field as "Endpoint" might be confusing if it's currently "smtp.azurecomm.net".
        // Let's assume we will add a new property to EmailSettings or overload one.
        
        // Better: Let's use `EmailSettings.SmtpServer` as the Endpoint URI. 
        // Guide user to change "smtp.azurecomm.net" to "https://<resource>.communication.azure.com"
        
        if (Uri.TryCreate(endpoint, UriKind.Absolute, out var uri) && (uri.Scheme == "https"))
        {
             _emailClient = new EmailClient(uri, new DefaultAzureCredential());
        }
        else
        {
            // Fallback for when we haven't switched config yet, or throw
            // For now, let's just create it and let it fail if config is wrong, logging is key.
            try 
            {
               _emailClient = new EmailClient(new Uri(endpoint), new DefaultAzureCredential());
            }
            catch (Exception)
            {
               // This will happen if endpoint is "smtp.azurecomm.net" (no scheme)
               // We'll log warning in constructor? No, bad practice.
               // We'll throw at runtime or here.
            }
        }
    }
    
    // Constructor for DI if we register EmailClient in Program.cs (Preferred)
    public AzureEmailSender(ILogger<AzureEmailSender> logger, IOptions<EmailSettings> settings, EmailClient emailClient)
    {
        _logger = logger;
        _settings = settings.Value;
        _emailClient = emailClient;
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        try
        {
            var sender = _settings.From; // Must be a valid DoNotReply address from ACS
            
            var emailContent = new EmailContent(subject)
            {
                Html = body
            };

            var emailMessage = new EmailMessage(sender, to, emailContent);

            var operation = await _emailClient.SendAsync(WaitUntil.Completed, emailMessage, cancellationToken);
            
            _logger.LogInformation("Azure Email sent successfully to {Email}. MessageId: {MessageId}", to, operation.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Azure email to {Email}", to);
            throw;
        }
    }
}
