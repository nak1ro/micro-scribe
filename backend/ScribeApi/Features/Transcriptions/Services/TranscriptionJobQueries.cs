using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ScribeApi.Common.Configuration.Plans;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Services;

public class TranscriptionJobQueries : ITranscriptionJobQueries
{
    private readonly AppDbContext _context;
    private readonly PlansOptions _plansOptions;

    public TranscriptionJobQueries(
        AppDbContext context, 
        IOptions<PlansOptions> plansOptions)
    {
        _context = context;
        _plansOptions = plansOptions.Value;
    }

    public async Task<PlanDefinition> GetUserPlanDefinitionAsync(
        string userId, 
        CancellationToken ct)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        var planType = user?.Plan ?? PlanType.Free;
        
        return _plansOptions.Plans.FirstOrDefault(p => p.PlanType == planType)
            ?? _plansOptions.Plans.First(p => p.PlanType == PlanType.Free);
    }

    public async Task<int> CountActiveJobsAsync(
        string userId, 
        CancellationToken ct)
    {
        return await _context.TranscriptionJobs
            .AsNoTracking()
            .Where(j => j.UserId == userId)
            .Where(j => j.Status == TranscriptionJobStatus.Pending 
                     || j.Status == TranscriptionJobStatus.Processing)
            .CountAsync(ct);
    }

    public async Task<MediaFile?> GetMediaFileByIdAsync(
        Guid mediaFileId, 
        string userId, 
        CancellationToken ct)
    {
        return await _context.MediaFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == mediaFileId 
                                   && m.UserId == userId, ct);
    }

    public async Task<TranscriptionJob?> GetJobByIdAsync(
        Guid jobId, 
        CancellationToken ct)
    {
        return await _context.TranscriptionJobs
            .FirstOrDefaultAsync(j => j.Id == jobId, ct);
    }

    public async Task<TranscriptionJob?> GetJobWithMediaAsync(
        Guid jobId, 
        CancellationToken ct)
    {
        return await _context.TranscriptionJobs
            .Include(j => j.MediaFile)
            .Include(j => j.User)
            .FirstOrDefaultAsync(j => j.Id == jobId, ct);
    }

    public async Task<ApplicationUser?> GetUserByIdAsync(
        string userId, 
        CancellationToken ct)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
    }
}
