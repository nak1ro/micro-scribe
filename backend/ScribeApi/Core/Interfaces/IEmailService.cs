namespace ScribeApi.Core.Interfaces;

public interface IEmailService
{
    Task SendEmailConfirmationAsync(string email, string userId, string token, CancellationToken cancellationToken = default);
    Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken = default);
    Task SendWelcomeEmailAsync(string email, string username, CancellationToken cancellationToken = default);
}
