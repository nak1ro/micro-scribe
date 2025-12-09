using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ScribeApi.Common.Interfaces;

namespace ScribeApi.Infrastructure.Storage;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(IConfiguration configuration, ILogger<LocalFileStorageService> logger)
    {
        _logger = logger;
        // Use "Uploads" as default folder relative to the execution directory
        var configuredPath = configuration["Storage:Local:BasePath"] ?? "Uploads";
        _basePath = Path.IsPathRooted(configuredPath) 
            ? configuredPath 
            : Path.Combine(Directory.GetCurrentDirectory(), configuredPath);

        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
            _logger.LogInformation("Created local storage directory at {Path}", _basePath);
        }
    }

    public async Task<string> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken ct)
    {
        // Sanitize filename to prevent directory traversal
        var safeFileName = Path.GetFileName(fileName);
        var fullPath = Path.Combine(_basePath, safeFileName);
        
        // Ensure unique filename if it exists
        if (File.Exists(fullPath))
        {
            var nameWithoutExt = Path.GetFileNameWithoutExtension(safeFileName);
            var ext = Path.GetExtension(safeFileName);
            var guid = Guid.NewGuid().ToString("N").Substring(0, 8);
            safeFileName = $"{nameWithoutExt}_{guid}{ext}";
            fullPath = Path.Combine(_basePath, safeFileName);
        }

        _logger.LogInformation("Saving file to {Path}", fullPath);

        await using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, true);
        await stream.CopyToAsync(fileStream, ct);

        // Return relative path or identifier that can be used to retrieve it later
        // For local storage, we can return the filename or relative path
        return safeFileName; 
    }

    public Task<Stream> OpenReadAsync(string path, CancellationToken ct)
    {
        var safeFileName = Path.GetFileName(path);
        var fullPath = Path.Combine(_basePath, safeFileName);

        if (!File.Exists(fullPath))
        {
            _logger.LogWarning("File not found at {Path}", fullPath);
            throw new FileNotFoundException("File not found", path);
        }

        // Return stream
        // Note: The caller is responsible for disposing the stream
        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, true);
        return Task.FromResult<Stream>(stream);
    }

    public Task DeleteAsync(string path, CancellationToken ct)
    {
        var safeFileName = Path.GetFileName(path);
        var fullPath = Path.Combine(_basePath, safeFileName);

        if (File.Exists(fullPath))
        {
            _logger.LogInformation("Deleting file at {Path}", fullPath);
            File.Delete(fullPath);
        }
        else
        {
            _logger.LogWarning("File not found for deletion at {Path}", fullPath);
        }

        return Task.CompletedTask;
    }
}
