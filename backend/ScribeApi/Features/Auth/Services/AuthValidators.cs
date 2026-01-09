using FluentValidation;
using ScribeApi.Features.Auth.Contracts;

namespace ScribeApi.Features.Auth.Services;

public static class ValidatorExtensions 
{
    public static IRuleBuilderOptions<T, string> PasswordStrength<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .MinimumLength(AuthConstants.Validation.MinPasswordLength)
            .Matches(AuthConstants.Validation.PasswordPatternUpper).WithMessage(AuthConstants.Validation.PasswordMessageUpper)
            .Matches(AuthConstants.Validation.PasswordPatternLower).WithMessage(AuthConstants.Validation.PasswordMessageLower)
            .Matches(AuthConstants.Validation.PasswordPatternDigit).WithMessage(AuthConstants.Validation.PasswordMessageDigit)
            .Matches(AuthConstants.Validation.PasswordPatternSpecial).WithMessage(AuthConstants.Validation.PasswordMessageSpecial);
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).PasswordStrength();
        RuleFor(x => x.ConfirmPassword).Equal(x => x.Password).WithMessage("Passwords do not match.");
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequestDto>
{
    public ForgotPasswordRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class ResendEmailConfirmationRequestValidator : AbstractValidator<ResendEmailConfirmationRequestDto>
{
    public ResendEmailConfirmationRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequestDto>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword).PasswordStrength();
        RuleFor(x => x.ConfirmNewPassword).Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
    }
}

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequestDto>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).PasswordStrength();
        RuleFor(x => x.ConfirmNewPassword).Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
    }
}

public class ExternalAuthRequestValidator : AbstractValidator<ExternalAuthRequestDto>
{
    public ExternalAuthRequestValidator()
    {
        RuleFor(x => x.Provider).NotEmpty();
        RuleFor(x => x.IdToken).NotEmpty();
    }
}

public class OAuthCallbackRequestValidator : AbstractValidator<OAuthCallbackRequestDto>
{
    private static readonly string[] ValidProviders = { AuthConstants.Providers.Google, AuthConstants.Providers.Microsoft };
    
    public OAuthCallbackRequestValidator()
    {
        RuleFor(x => x.Provider)
            .NotEmpty()
            .Must(p => ValidProviders.Contains(p.ToLower()))
            .WithMessage($"Invalid OAuth provider. Supported providers: {AuthConstants.Providers.Google}, {AuthConstants.Providers.Microsoft}");
        
        RuleFor(x => x.Code).NotEmpty().WithMessage("Authorization code is required");
    }
}

public class OAuthLoginRequestValidator : AbstractValidator<OAuthLoginRequestDto>
{
    private static readonly string[] ValidProviders = { AuthConstants.Providers.Google, AuthConstants.Providers.Microsoft };
    
    public OAuthLoginRequestValidator()
    {
        RuleFor(x => x.Provider)
            .NotEmpty()
            .Must(p => ValidProviders.Contains(p.ToLower()))
            .WithMessage($"Invalid OAuth provider. Supported providers: {AuthConstants.Providers.Google}, {AuthConstants.Providers.Microsoft}");
        
        RuleFor(x => x.IdToken).NotEmpty().WithMessage("ID token is required");
    }
}

public class LinkOAuthAccountRequestValidator : AbstractValidator<LinkOAuthAccountRequestDto>
{
    private static readonly string[] ValidProviders = { AuthConstants.Providers.Google, AuthConstants.Providers.Microsoft };
    
    public LinkOAuthAccountRequestValidator()
    {
        RuleFor(x => x.Provider)
            .NotEmpty()
            .Must(p => ValidProviders.Contains(p.ToLower()))
            .WithMessage($"Invalid OAuth provider. Supported providers: {AuthConstants.Providers.Google}, {AuthConstants.Providers.Microsoft}");
        
        RuleFor(x => x.IdToken).NotEmpty().WithMessage("ID token is required");
    }
}
