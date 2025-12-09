using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ScribeApi.Common.Configuration.Plans;
using ScribeApi.Features.Uploads.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads.Services;

public class UploadQueries : IUploadQueries
{
    private readonly AppDbContext _context;
    private readonly PlansOptions _plansOptions;

    public UploadQueries(AppDbContext context, IOptions<PlansOptions> plansOptions)
    {
        _context = context;
        _plansOptions = plansOptions.Value;
    }

    public async Task<PlanDefinition> GetUserPlanDefinitionAsync(string userId, CancellationToken ct)
    {
        var subscription = await _context.Subscriptions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == SubscriptionStatus.Active, ct);

        var planType = subscription?.Plan ?? PlanType.Free;
        
        return _plansOptions.Plans.FirstOrDefault(p => p.PlanType == planType) 
               ?? _plansOptions.Plans.First(p => p.PlanType == PlanType.Free);
    }

    public async Task<int> CountActiveSessionsAsync(string userId, CancellationToken ct)
    {
        return await _context.UploadSessions
            .CountAsync(s => s.UserId == userId && s.Status == UploadSessionStatus.Active, ct);
    }

    public async Task<UploadSession?> GetSessionAsync(Guid sessionId, string userId, CancellationToken ct)
    {
        return await _context.UploadSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);
    }
}