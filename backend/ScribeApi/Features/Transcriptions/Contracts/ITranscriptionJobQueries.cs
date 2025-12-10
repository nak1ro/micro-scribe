using ScribeApi.Common.Configuration.Plans;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Contracts;

public interface ITranscriptionJobQueries
{
    // Get user's plan definition
    Task<PlanDefinition> GetUserPlanDefinitionAsync(string userId, CancellationToken ct);
    
    // Count active jobs (Pending or Processing)
    Task<int> CountActiveJobsAsync(string userId, CancellationToken ct);
    
    // Get MediaFile with ownership validation
    Task<MediaFile?> GetMediaFileByIdAsync(Guid mediaFileId, string userId, CancellationToken ct);
    
    // Get TranscriptionJob by ID (for runner)
    Task<TranscriptionJob?> GetJobByIdAsync(Guid jobId, CancellationToken ct);
    
    // Get TranscriptionJob with MediaFile included
    Task<TranscriptionJob?> GetJobWithMediaAsync(Guid jobId, CancellationToken ct);
    
    // Get user by ID (for updating usage)
    Task<ApplicationUser?> GetUserByIdAsync(string userId, CancellationToken ct);
}