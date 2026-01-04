namespace ScribeApi.Features.Analysis.Contracts;

public interface IAnalysisService
{
    Task<List<TranscriptionAnalysisDto>> EnqueueAnalysisGenerationAsync(Guid jobId, string userId, GenerateAnalysisRequest request, CancellationToken ct);
    Task ProcessAnalysisJobAsync(Guid jobId, Guid analysisJobId, CancellationToken ct);
    Task<List<TranscriptionAnalysisDto>> TranslateAnalysisAsync(Guid jobId, string userId, TranslateAnalysisRequest request, CancellationToken ct);
    Task<List<TranscriptionAnalysisDto>> TranslateAnalysisWithAzureAsync(Guid jobId, string userId, string sourceLanguage, string targetLanguage, CancellationToken ct);
    Task<List<TranscriptionAnalysisDto>> GetAnalysesAsync(Guid jobId, string userId, CancellationToken ct);
}
