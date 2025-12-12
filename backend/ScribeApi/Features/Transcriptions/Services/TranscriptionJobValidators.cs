using FluentValidation;
using ScribeApi.Features.Transcriptions.Contracts;

namespace ScribeApi.Features.Transcriptions.Services;

public class CreateTranscriptionJobRequestValidator : AbstractValidator<CreateTranscriptionJobRequest>
{
    public CreateTranscriptionJobRequestValidator()
    {
        RuleFor(x => x)
            .Must(x => x.MediaFileId.HasValue || x.UploadSessionId.HasValue)
            .WithMessage("Either MediaFileId or UploadSessionId must be provided.");

        RuleFor(x => x.LanguageCode)
            .MaximumLength(10)
            .When(x => x.LanguageCode != null);

        RuleFor(x => x.Quality)
            .IsInEnum()
            .WithMessage("Invalid transcription quality.");
    }
}