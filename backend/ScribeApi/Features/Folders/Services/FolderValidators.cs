using FluentValidation;

namespace ScribeApi.Features.Folders.Services;

public class CreateFolderRequestValidator : AbstractValidator<Contracts.CreateFolderRequest>
{
    public CreateFolderRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Folder name is required.")
            .MaximumLength(100).WithMessage("Folder name must not exceed 100 characters.");

        RuleFor(x => x.Color)
            .IsInEnum().WithMessage("Invalid folder color.");
    }
}

public class UpdateFolderRequestValidator : AbstractValidator<Contracts.UpdateFolderRequest>
{
    public UpdateFolderRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Folder name is required.")
            .MaximumLength(100).WithMessage("Folder name must not exceed 100 characters.");

        RuleFor(x => x.Color)
            .IsInEnum().WithMessage("Invalid folder color.");
    }
}

public class UpdateFolderItemsRequestValidator : AbstractValidator<Contracts.UpdateFolderItemsRequest>
{
    public UpdateFolderItemsRequestValidator()
    {
        RuleFor(x => x.TranscriptionJobIds)
            .NotEmpty().WithMessage("At least one transcription job ID is required.");
    }
}
