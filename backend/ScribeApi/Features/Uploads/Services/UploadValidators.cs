using FluentValidation;
using ScribeApi.Features.Uploads.Contracts;

namespace ScribeApi.Features.Uploads.Services;

public class InitiateUploadRequestValidator : AbstractValidator<InitiateUploadRequest>
{
    public InitiateUploadRequestValidator()
    {
        RuleFor(x => x.FileName)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(x => x.ContentType)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.SizeBytes)
            .GreaterThan(0)
            .WithMessage("File size must be greater than 0.");

        RuleFor(x => x.ClientRequestId)
            .MaximumLength(100)
            .When(x => x.ClientRequestId != null);
    }
}

public class CompleteUploadRequestValidator : AbstractValidator<CompleteUploadRequest>
{
    public CompleteUploadRequestValidator()
    {
        RuleForEach(x => x.Parts)
            .ChildRules(part =>
            {
                part.RuleFor(p => p.PartNumber).GreaterThan(0);
                part.RuleFor(p => p.ETag).NotEmpty();
            })
            .When(x => x.Parts != null && x.Parts.Any());
    }
}
