using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Exceptions;
using ScribeApi.Features.Folders.Contracts;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Folders.Services;

public class FolderService : IFolderService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public FolderService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<FolderDto>> ListFoldersAsync(string userId, CancellationToken ct)
    {
        var folders = await _context.Folders
            .AsNoTracking()
            .Include(f => f.FolderTranscriptionJobs)
            .Where(f => f.UserId == userId)
            .OrderBy(f => f.Name)
            .ToListAsync(ct);

        return _mapper.Map<List<FolderDto>>(folders);
    }

    public async Task<FolderDto> GetFolderAsync(Guid folderId, string userId, CancellationToken ct)
    {
        var folder = await GetFolderOrThrowAsync(folderId, userId, ct);
        return _mapper.Map<FolderDto>(folder);
    }

    public async Task<FolderDto> CreateFolderAsync(string userId, CreateFolderRequest request, CancellationToken ct)
    {
        await EnsureUniqueNameAsync(userId, request.Name, null, ct);

        var folder = new Folder
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Color = request.Color,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Folders.Add(folder);
        await _context.SaveChangesAsync(ct);

        return _mapper.Map<FolderDto>(folder);
    }

    public async Task<FolderDto> UpdateFolderAsync(Guid folderId, string userId, UpdateFolderRequest request, CancellationToken ct)
    {
        var folder = await GetFolderOrThrowAsync(folderId, userId, ct, includeItems: true);

        await EnsureUniqueNameAsync(userId, request.Name, folderId, ct);

        folder.Name = request.Name;
        folder.Color = request.Color;

        await _context.SaveChangesAsync(ct);

        return _mapper.Map<FolderDto>(folder);
    }

    public async Task DeleteFolderAsync(Guid folderId, string userId, CancellationToken ct)
    {
        var folder = await GetFolderOrThrowAsync(folderId, userId, ct);
        _context.Folders.Remove(folder);
        await _context.SaveChangesAsync(ct);
    }

    public async Task AddItemsAsync(Guid folderId, string userId, List<Guid> jobIds, CancellationToken ct)
    {
        var folder = await GetFolderOrThrowAsync(folderId, userId, ct, includeItems: true);

        var existingJobIds = folder.FolderTranscriptionJobs
            .Select(ftj => ftj.TranscriptionJobId)
            .ToHashSet();

        var validJobIds = await _context.TranscriptionJobs
            .Where(j => j.UserId == userId && jobIds.Contains(j.Id))
            .Select(j => j.Id)
            .ToListAsync(ct);

        foreach (var jobId in validJobIds)
        {
            if (!existingJobIds.Contains(jobId))
            {
                folder.FolderTranscriptionJobs.Add(new FolderTranscriptionJob
                {
                    FolderId = folderId,
                    TranscriptionJobId = jobId,
                    AddedAtUtc = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync(ct);
    }

    public async Task RemoveItemsAsync(Guid folderId, string userId, List<Guid> jobIds, CancellationToken ct)
    {
        await GetFolderOrThrowAsync(folderId, userId, ct);

        var itemsToRemove = await _context.FolderTranscriptionJobs
            .Where(ftj => ftj.FolderId == folderId && jobIds.Contains(ftj.TranscriptionJobId))
            .ToListAsync(ct);

        _context.FolderTranscriptionJobs.RemoveRange(itemsToRemove);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<PagedResponse<TranscriptionJobListItem>> GetFolderItemsAsync(
        Guid folderId, string userId, int page, int pageSize, CancellationToken ct)
    {
        await GetFolderOrThrowAsync(folderId, userId, ct);

        var query = _context.FolderTranscriptionJobs
            .AsNoTracking()
            .Where(ftj => ftj.FolderId == folderId)
            .Select(ftj => ftj.TranscriptionJob)
            .Where(j => j.UserId == userId);

        var totalCount = await query.CountAsync(ct);

        var jobs = await query
            .Include(j => j.MediaFile)
            .OrderByDescending(j => j.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = jobs.Select(j => new TranscriptionJobListItem
        {
            JobId = j.Id,
            OriginalFileName = j.MediaFile?.OriginalFileName ?? "Unknown",
            Status = j.Status,
            Quality = j.Quality,
            LanguageCode = j.LanguageCode,
            DurationSeconds = j.MediaFile?.DurationSeconds,
            CreatedAtUtc = j.CreatedAtUtc,
            CompletedAtUtc = j.CompletedAtUtc
        }).ToList();

        return new PagedResponse<TranscriptionJobListItem>(items, page, pageSize, totalCount);
    }

    // Helper to get folder with ownership check
    private async Task<Folder> GetFolderOrThrowAsync(Guid folderId, string userId, CancellationToken ct, bool includeItems = false)
    {
        var query = _context.Folders.Where(f => f.Id == folderId && f.UserId == userId);

        if (includeItems)
            query = query.Include(f => f.FolderTranscriptionJobs);

        var folder = await query.FirstOrDefaultAsync(ct);

        if (folder == null)
            throw new NotFoundException($"Folder {folderId} not found.");

        return folder;
    }

    // Helper to ensure folder name is unique per user
    private async Task EnsureUniqueNameAsync(string userId, string name, Guid? excludeFolderId, CancellationToken ct)
    {
        var query = _context.Folders.Where(f => f.UserId == userId && f.Name == name);

        if (excludeFolderId.HasValue)
            query = query.Where(f => f.Id != excludeFolderId.Value);

        if (await query.AnyAsync(ct))
            throw new ConflictException($"A folder with name '{name}' already exists.");
    }
}
