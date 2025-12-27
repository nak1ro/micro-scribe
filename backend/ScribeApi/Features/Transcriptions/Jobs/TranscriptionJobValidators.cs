using FluentValidation;
using ScribeApi.Features.Transcriptions.Contracts;

namespace ScribeApi.Features.Transcriptions.Jobs;

public class CreateTranscriptionJobRequestValidator : AbstractValidator<CreateTranscriptionJobRequest>
{
    public CreateTranscriptionJobRequestValidator()
    {
        RuleFor(x => x)
            .Must(x => x.MediaFileId.HasValue || x.UploadSessionId.HasValue)
            .WithMessage("Either MediaFileId or UploadSessionId must be provided.");

        RuleFor(x => x.SourceLanguage)
            .MaximumLength(10)
            .When(x => x.SourceLanguage != null);

        RuleFor(x => x.Quality)
            .IsInEnum()
            .WithMessage("Invalid transcription quality.");
    }
}
