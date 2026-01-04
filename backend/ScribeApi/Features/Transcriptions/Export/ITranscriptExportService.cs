using ScribeApi.Features.Transcriptions.Contracts;

namespace ScribeApi.Features.Transcriptions.Export;

public record ExportResult(byte[] Content, string ContentType, string FileName, string? RedirectUrl = null);

public interface ITranscriptExportService
{
    Task<ExportResult> ExportAsync(Guid jobId, string userId, ExportFormat format, string? language, CancellationToken ct);
}
