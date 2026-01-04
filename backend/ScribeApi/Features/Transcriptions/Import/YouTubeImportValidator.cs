using FluentValidation;
using ScribeApi.Features.Transcriptions.Contracts;

namespace ScribeApi.Features.Transcriptions.Import;

public class YouTubeImportValidator : AbstractValidator<YouTubeImportRequest>
{
    // Basic YouTube CLI regex to catch most valid URLs
    private const string YouTubeUrlPattern = @"^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$";

    public YouTubeImportValidator()
    {
        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("YouTube URL is required.")
            .Matches(YouTubeUrlPattern).WithMessage("Please provide a valid YouTube URL.");
    }
}
