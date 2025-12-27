using FluentValidation;
using ScribeApi.Features.Uploads.Contracts;

namespace ScribeApi.Features.Uploads.Services;

public class InitiateUploadRequestValidator : AbstractValidator<InitiateUploadRequest>
{
    public InitiateUploadRequestValidator()
    {
        RuleFor(x => x.FileName)
            .NotEmpty()
            .MaximumLength(255)
            .Must(fileName =>
            {
                var allowedExtensions = new[] { ".mp3", ".wav", ".m4a", ".mp4", ".mov", ".ogg", ".flac", ".webm", ".aac", ".wma" };
                var ext = Path.GetExtension(fileName).ToLowerInvariant();
                return allowedExtensions.Contains(ext);
            })
            .WithMessage("File type not allowed. Supported formats: MP3, WAV, M4A, MP4, MOV, OGG, FLAC, WEBM, AAC, WMA.");

        RuleFor(x => x.ContentType)
            .NotEmpty()
            .MaximumLength(100)
            .Must(ct => ct.StartsWith("audio/") || ct.StartsWith("video/"))
            .WithMessage("Only audio and video files are allowed.");

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
