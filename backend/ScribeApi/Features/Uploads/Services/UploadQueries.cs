using Microsoft.EntityFrameworkCore;
using ScribeApi.Common.Configuration.Plans;
using ScribeApi.Features.Uploads.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads.Services;

public class UploadQueries : IUploadQueries
{
    private readonly AppDbContext _context;

    public UploadQueries(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PlanType> GetUserPlanTypeAsync(string userId, CancellationToken ct)
    {
        var subscription = await _context.Subscriptions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == SubscriptionStatus.Active, ct);

        return subscription?.Plan ?? PlanType.Free;
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