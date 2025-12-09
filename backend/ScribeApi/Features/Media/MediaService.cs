using AutoMapper;
using ScribeApi.Common.Exceptions;
using ScribeApi.Common.Interfaces;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Infrastructure.Persistence;

namespace ScribeApi.Features.Media;

public class MediaService : IMediaService
{
    private readonly IMediaQueries _mediaQueries;
    private readonly AppDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly IMapper _mapper;

    public MediaService(
        IMediaQueries mediaQueries, 
        AppDbContext context, 
        IFileStorageService fileStorageService, 
        IMapper mapper)
    {
        _mediaQueries = mediaQueries;
        _context = context;
        _fileStorageService = fileStorageService;
        _mapper = mapper;
    }

    public async Task<MediaFileDto> GetMediaFileAsync(Guid id, string userId, CancellationToken ct = default)
    {
        var mediaFile = await _mediaQueries.GetByIdAsync(id, userId, ct);
        if (mediaFile == null)
        {
            throw new NotFoundException("Media file not found.");
        }

        return _mapper.Map<MediaFileDto>(mediaFile);
    }

    public async Task<PagedResponse<MediaFileDto>> ListMediaFilesAsync(string userId, int page, int pageSize, CancellationToken ct = default)
    {
        var pagedMediaFiles = await _mediaQueries.ListAsync(userId, page, pageSize, ct);
        
        var dtos = _mapper.Map<IEnumerable<MediaFileDto>>(pagedMediaFiles.Items);
        
        return new PagedResponse<MediaFileDto>(dtos, pagedMediaFiles.Page, pagedMediaFiles.PageSize, pagedMediaFiles.TotalCount);
    }

    public async Task DeleteMediaFileAsync(Guid id, string userId, CancellationToken ct = default)
    {
        var mediaFile = await _context.MediaFiles.FindAsync([id], ct);
        
        if (mediaFile == null || mediaFile.UserId != userId)
        {
            throw new NotFoundException("Media file not found.");
        }
        
        if (!string.IsNullOrEmpty(mediaFile.OriginalPath))
        {
             await _fileStorageService.DeleteAsync(mediaFile.OriginalPath, ct);
        }

        if (!string.IsNullOrEmpty(mediaFile.AudioPath) && mediaFile.AudioPath != mediaFile.OriginalPath)
        {
            await _fileStorageService.DeleteAsync(mediaFile.AudioPath, ct);
        }

        _context.MediaFiles.Remove(mediaFile);
        await _context.SaveChangesAsync(ct);
    }
}
