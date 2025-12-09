using FluentValidation;
using ScribeApi.Features.Uploads.Contracts;

namespace ScribeApi.Features.Uploads.Services;

public class InitUploadRequestValidator : AbstractValidator<InitUploadRequest>
{
    public InitUploadRequestValidator()
    {
        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required.");

        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("Content type is required.");

        RuleFor(x => x.TotalSizeBytes)
            .GreaterThan(0).WithMessage("Total size must be greater than 0.");

        RuleFor(x => x.ChunkSizeBytes)
            .GreaterThan(0).WithMessage("Chunk size must be greater than 0.");
    }
}

public class UploadChunkRequestValidator : AbstractValidator<UploadChunkRequest>
{
    public UploadChunkRequestValidator()
    {
        RuleFor(x => x.SessionId)
            .NotEmpty().WithMessage("Session ID is required.");

        RuleFor(x => x.ChunkIndex)
            .GreaterThanOrEqualTo(0).WithMessage("Chunk index must be 0 or greater.");

        RuleFor(x => x.Chunk)
            .NotNull().WithMessage("Chunk file is required.");
    }
}
