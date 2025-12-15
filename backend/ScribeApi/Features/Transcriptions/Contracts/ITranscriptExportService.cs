namespace ScribeApi.Features.Transcriptions.Contracts
{
    public record ExportResult(byte[] Content, string ContentType, string FileName);

    public interface ITranscriptExportService
    {
        Task<ExportResult> ExportAsync(Guid jobId, string userId, ExportFormat format, CancellationToken ct);
    }
}
