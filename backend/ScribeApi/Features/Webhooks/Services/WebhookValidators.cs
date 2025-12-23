using FluentValidation;
using ScribeApi.Features.Webhooks.Contracts;

namespace ScribeApi.Features.Webhooks.Services;

public class CreateWebhookRequestValidator : AbstractValidator<CreateWebhookRequest>
{
    public CreateWebhookRequestValidator()
    {
        RuleFor(x => x.Url)
            .NotEmpty()
            .Must(BeAValidUrl)
            .WithMessage("Url must be a valid absolute URL (http or https).");

        RuleFor(x => x.Secret)
            .NotEmpty()
            .MinimumLength(8)
            .WithMessage("Secret must be at least 8 characters long.");
    }

    private bool BeAValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
               && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}

public class UpdateWebhookRequestValidator : AbstractValidator<UpdateWebhookRequest>
{
    public UpdateWebhookRequestValidator()
    {
        RuleFor(x => x.Url)
            .Must(BeAValidUrl)
            .When(x => !string.IsNullOrEmpty(x.Url))
            .WithMessage("Url must be a valid absolute URL (http or https).");

        RuleFor(x => x.Secret)
            .MinimumLength(8)
            .When(x => !string.IsNullOrEmpty(x.Secret))
            .WithMessage("Secret must be at least 8 characters long.");
    }

    private bool BeAValidUrl(string? url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
               && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
