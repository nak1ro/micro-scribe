using Microsoft.EntityFrameworkCore;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Media.Services;

public class MediaQueries : IMediaQueries
{
    private readonly AppDbContext _context;

    public MediaQueries(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MediaFile?> GetByIdAsync(Guid id, string userId, CancellationToken ct = default)
    {
        return await _context.MediaFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
    }

    public async Task<PagedResponse<MediaFile>> ListAsync(string userId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.MediaFiles
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc);

        var totalCount = await query.CountAsync(ct);
        
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResponse<MediaFile>(items, page, pageSize, totalCount);
    }
}
