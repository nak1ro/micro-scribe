using FluentValidation;
using ScribeApi.Features.Billing.Contracts;

namespace ScribeApi.Features.Billing.Services;

// FluentValidation rules for billing requests
public class CreateCheckoutSessionRequestValidator : AbstractValidator<CreateCheckoutSessionRequest>
{
    public CreateCheckoutSessionRequestValidator()
    {
        RuleFor(x => x.SuccessUrl)
            .Must(BeAValidUrl)
            .When(x => !string.IsNullOrEmpty(x.SuccessUrl))
            .WithMessage("SuccessUrl must be a valid absolute URL (http or https).");

        RuleFor(x => x.CancelUrl)
            .Must(BeAValidUrl)
            .When(x => !string.IsNullOrEmpty(x.CancelUrl))
            .WithMessage("CancelUrl must be a valid absolute URL (http or https).");
    }

    private bool BeAValidUrl(string? url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
               && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}

public class CreatePortalSessionRequestValidator : AbstractValidator<CreatePortalSessionRequest>
{
    public CreatePortalSessionRequestValidator()
    {
        RuleFor(x => x.ReturnUrl)
            .Must(BeAValidUrl)
            .When(x => !string.IsNullOrEmpty(x.ReturnUrl))
            .WithMessage("ReturnUrl must be a valid absolute URL (http or https).");
    }

    private bool BeAValidUrl(string? url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
               && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
