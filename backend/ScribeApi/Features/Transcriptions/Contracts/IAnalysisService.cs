using ScribeApi.Features.Transcriptions.Contracts;

namespace ScribeApi.Features.Transcriptions.Contracts;

public interface IAnalysisService
{
    Task<List<TranscriptionAnalysisDto>> GenerateAnalysisAsync(Guid jobId, string userId, GenerateAnalysisRequest request, CancellationToken ct);
    Task<List<TranscriptionAnalysisDto>> TranslateAnalysisAsync(Guid jobId, string userId, TranslateAnalysisRequest request, CancellationToken ct);
    Task<List<TranscriptionAnalysisDto>> TranslateAnalysisWithAzureAsync(Guid jobId, string userId, string sourceLanguage, string targetLanguage, CancellationToken ct);
    Task<List<TranscriptionAnalysisDto>> GetAnalysesAsync(Guid jobId, string userId, CancellationToken ct);
}
