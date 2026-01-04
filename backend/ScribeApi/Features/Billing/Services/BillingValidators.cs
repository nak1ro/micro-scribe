using FluentValidation;
using ScribeApi.Features.Billing.Contracts;

namespace ScribeApi.Features.Billing.Services;

// FluentValidation rules for billing requests
public class CreateSetupIntentRequestValidator : AbstractValidator<CreateSetupIntentRequest>
{
    public CreateSetupIntentRequestValidator()
    {
        RuleFor(x => x.Interval).IsInEnum();
    }
}

public class ConfirmSubscriptionRequestValidator : AbstractValidator<ConfirmSubscriptionRequest>
{
    public ConfirmSubscriptionRequestValidator()
    {
        RuleFor(x => x.PaymentMethodId)
            .NotEmpty()
            .WithMessage("PaymentMethodId is required.");

        RuleFor(x => x.Interval).IsInEnum();
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
