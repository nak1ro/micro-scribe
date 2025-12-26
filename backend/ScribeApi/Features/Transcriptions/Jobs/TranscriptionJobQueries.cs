using Microsoft.EntityFrameworkCore;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Jobs;

public class TranscriptionJobQueries : ITranscriptionJobQueries
{
    private readonly AppDbContext _context;

    public TranscriptionJobQueries(AppDbContext context)
    {
        _context = context;
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

    public async Task<int> CountDailyJobsAsync(string userId, DateTime dateUtc, CancellationToken ct)
    {
        var startOfDay = dateUtc.Date;
        var endOfDay = startOfDay.AddDays(1);

        return await _context.TranscriptionJobs
            .AsNoTracking()
            .Where(j => j.UserId == userId)
            .Where(j => j.CreatedAtUtc >= startOfDay && j.CreatedAtUtc < endOfDay)
            .CountAsync(ct);
    }

    public async Task<bool> HasPendingJobForMediaAsync(Guid mediaFileId, string userId, CancellationToken ct)
    {
        return await _context.TranscriptionJobs
            .AsNoTracking()
            .AnyAsync(j => j.MediaFileId == mediaFileId 
                           && j.UserId == userId 
                           && (j.Status == TranscriptionJobStatus.Pending || j.Status == TranscriptionJobStatus.Processing), ct);
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

    public async Task<TranscriptionJob?> GetJobWithSegmentsAsync(
        Guid jobId,
        CancellationToken ct)
    {
        return await _context.TranscriptionJobs
            .Include(j => j.MediaFile)
            .FirstOrDefaultAsync(j => j.Id == jobId, ct);
    }

    public async Task<ApplicationUser?> GetUserByIdAsync(
        string userId, 
        CancellationToken ct)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
    }

    public async Task<(List<TranscriptionJob> Items, int TotalCount)> GetUserJobsAsync(
        string userId, int page, int pageSize, CancellationToken ct)
    {
        var query = _context.TranscriptionJobs
            .AsNoTracking()
            .Include(j => j.MediaFile)
            .Where(j => j.UserId == userId)
            .OrderByDescending(j => j.CreatedAtUtc);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }
}
