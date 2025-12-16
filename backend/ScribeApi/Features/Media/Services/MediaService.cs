using AutoMapper;
using ScribeApi.Core.Exceptions;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Infrastructure.Storage;

namespace ScribeApi.Features.Media.Services;

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

        var dto = _mapper.Map<MediaFileDto>(mediaFile);

        // Generate Presigned URL
        try 
        {
            if (!string.IsNullOrEmpty(mediaFile.StorageObjectKey))
            {
                // Expiry is 15 minutes by default for security
                dto.PresignedUrl = await _fileStorageService.GenerateDownloadUrlAsync(mediaFile.StorageObjectKey, TimeSpan.FromMinutes(15), ct);
            }
        }
        catch (NotSupportedException) 
        { 
            // Local storage doesn't support this, field stays null
        }

        return dto;
    }

    public async Task<PagedResponse<MediaFileDto>> ListMediaFilesAsync(string userId, int page, int pageSize,
        CancellationToken ct = default)
    {
        var pagedMediaFiles = await _mediaQueries.ListAsync(userId, page, pageSize, ct);

        var dtos = _mapper.Map<IEnumerable<MediaFileDto>>(pagedMediaFiles.Items).ToList();

        // Populate URLs in parallel
        // Note: For large lists this might be many S3 calls (usually local calculation for pre-signed URLs, so fast)
        var tasks = dtos.Select(async dto =>
        {
            try
            {
                // Find matching entity to get key logic if not in DTO? 
                // DTO has AudioPath mapped from NormalizedAudioObjectKey or StorageObjectKey?
                // Let's assume we need the key. DTO usually exposes "AudioPath". 
                // But let's check mapping. The mapped "AudioPath" might be the key.
                // If S3, AudioPath IS the key.
                if (!string.IsNullOrEmpty(dto.AudioPath))
                {
                     var url = await _fileStorageService.GenerateDownloadUrlAsync(dto.AudioPath, TimeSpan.FromMinutes(15), ct);
                     dto.PresignedUrl = url;
                }
            }
            catch (NotSupportedException) { }
            return dto;
        });

        dtos = (await Task.WhenAll(tasks)).ToList();

        return new PagedResponse<MediaFileDto>(dtos, pagedMediaFiles.Page, pagedMediaFiles.PageSize,
            pagedMediaFiles.TotalCount);
    }

    public async Task DeleteMediaFileAsync(Guid id, string userId, CancellationToken ct = default)
    {
        var mediaFile = await _context.MediaFiles.FindAsync([id], ct);

        if (mediaFile == null || mediaFile.UserId != userId)
        {
            throw new NotFoundException("Media file not found.");
        }

        await DeleteMediaFilesAsync(mediaFile, ct);

        _context.MediaFiles.Remove(mediaFile);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteMediaFilesAsync(MediaFile mediaFile, CancellationToken ct = default)
    {
        if (!string.IsNullOrEmpty(mediaFile.StorageObjectKey))
        {
            try
            {
                await _fileStorageService.DeleteAsync(mediaFile.StorageObjectKey, ct);
            }
            catch
            {
                // Ignored for cleanup resilience 
            }
        }

        if (!string.IsNullOrEmpty(mediaFile.NormalizedAudioObjectKey) &&
            mediaFile.NormalizedAudioObjectKey != mediaFile.StorageObjectKey)
        {
            try
            {
                await _fileStorageService.DeleteAsync(mediaFile.NormalizedAudioObjectKey, ct);
            }
            catch
            {
                // Ignored for cleanup resilience 
            }
        }
    }
}