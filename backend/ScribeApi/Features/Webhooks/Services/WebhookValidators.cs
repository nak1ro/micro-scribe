using FluentValidation;
using ScribeApi.Features.Webhooks.Contracts;

namespace ScribeApi.Features.Webhooks.Services;

public class CreateWebhookRequestValidator : AbstractValidator<CreateWebhookRequest>
{
    public CreateWebhookRequestValidator()
    {
        RuleFor(x => x.Url)
            .NotEmpty()
            .Must(BeValidUrl)
            .WithMessage("URL must be a valid HTTPS URL.");

        RuleFor(x => x.Secret)
            .NotEmpty()
            .MinimumLength(16)
            .WithMessage("Secret must be at least 16 characters.");

        RuleFor(x => x.Events)
            .NotEmpty()
            .Must(events => events.All(e => WebhookEvents.All.Contains(e)))
            .WithMessage($"Events must be one of: {string.Join(", ", WebhookEvents.All)}");
    }

    private static bool BeValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
    }
}

public class UpdateWebhookRequestValidator : AbstractValidator<UpdateWebhookRequest>
{
    public UpdateWebhookRequestValidator()
    {
        RuleFor(x => x.Url)
            .Must(BeValidUrl!)
            .When(x => x.Url != null)
            .WithMessage("URL must be a valid HTTPS URL.");

        RuleFor(x => x.Secret)
            .MinimumLength(16)
            .When(x => x.Secret != null)
            .WithMessage("Secret must be at least 16 characters.");

        RuleFor(x => x.Events)
            .Must(events => events!.All(e => WebhookEvents.All.Contains(e)))
            .When(x => x.Events != null)
            .WithMessage($"Events must be one of: {string.Join(", ", WebhookEvents.All)}");
    }

    private static bool BeValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
    }
}
