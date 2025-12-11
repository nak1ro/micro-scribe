using FluentValidation;
using ScribeApi.Features.Auth.Contracts;

namespace ScribeApi.Features.Auth.Services;

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
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

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequestDto>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
        RuleFor(x => x.ConfirmNewPassword).Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
    }
}

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequestDto>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
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
    private static readonly string[] ValidProviders = { "google" };
    
    public OAuthCallbackRequestValidator()
    {
        RuleFor(x => x.Provider)
            .NotEmpty()
            .Must(p => ValidProviders.Contains(p.ToLower()))
            .WithMessage("Invalid OAuth provider. Supported providers: google");
        
        RuleFor(x => x.Code).NotEmpty().WithMessage("Authorization code is required");
    }
}

public class OAuthLoginRequestValidator : AbstractValidator<OAuthLoginRequestDto>
{
    private static readonly string[] ValidProviders = { "google" };
    
    public OAuthLoginRequestValidator()
    {
        RuleFor(x => x.Provider)
            .NotEmpty()
            .Must(p => ValidProviders.Contains(p.ToLower()))
            .WithMessage("Invalid OAuth provider. Supported providers: google");
        
        RuleFor(x => x.IdToken).NotEmpty().WithMessage("ID token is required");
    }
}

public class LinkOAuthAccountRequestValidator : AbstractValidator<LinkOAuthAccountRequestDto>
{
    private static readonly string[] ValidProviders = { "google" };
    
    public LinkOAuthAccountRequestValidator()
    {
        RuleFor(x => x.Provider)
            .NotEmpty()
            .Must(p => ValidProviders.Contains(p.ToLower()))
            .WithMessage("Invalid OAuth provider. Supported providers: google");
        
        RuleFor(x => x.IdToken).NotEmpty().WithMessage("ID token is required");
    }
}