using ScribeApi.Features.Transcriptions.Contracts;

namespace ScribeApi.Features.Transcriptions.Export;

public record ExportResult(byte[] Content, string ContentType, string FileName);

public interface ITranscriptExportService
{
    Task<ExportResult> ExportAsync(Guid jobId, string userId, ExportFormat format, CancellationToken ct);
}
