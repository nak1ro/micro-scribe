using ScribeApi.Core.Interfaces;
using ScribeApi.Core.Storage;

namespace ScribeApi.Infrastructure.Storage;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(IConfiguration configuration, ILogger<LocalFileStorageService> logger)
    {
        _logger = logger;
        var configuredPath = configuration["Storage:Local:BasePath"] ?? "Uploads";
        _basePath = Path.IsPathRooted(configuredPath) ? configuredPath : Path.Combine(Directory.GetCurrentDirectory(), configuredPath);

        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
            _logger.LogInformation("Created local storage directory at {Path}", _basePath);
        }
    }

    public string BucketName => "local";

    public Task<StorageObjectInfo?> GetObjectInfoAsync(string key, CancellationToken ct)
    {
        var fullPath = GetFullPath(key);

        if (!File.Exists(fullPath)) return Task.FromResult<StorageObjectInfo?>(null);

        var info = new FileInfo(fullPath);
        var hash = Convert.ToBase64String(System.Security.Cryptography.MD5.HashData(System.Text.Encoding.UTF8.GetBytes(key)));
        return Task.FromResult<StorageObjectInfo?>(new StorageObjectInfo(key, info.Length, hash, info.LastWriteTimeUtc));
    }

    public Task<PresignedUploadResult> GenerateUploadUrlAsync(string key, string contentType, long sizeBytes, CancellationToken ct)
    {
        throw new NotSupportedException("LocalFileStorageService does not support presigned URLs. Use S3 provider for production.");
    }

    public Task<MultipartUploadInitResult> InitiateMultipartUploadAsync(string key, string contentType, long totalSizeBytes, CancellationToken ct)
    {
        throw new NotSupportedException("LocalFileStorageService does not support multipart uploads. Use S3 provider for production.");
    }

    public Task<string> GeneratePartUploadUrlAsync(string key, string uploadId, int partNumber, CancellationToken ct)
    {
        throw new NotSupportedException("LocalFileStorageService does not support presigned URLs. Use S3 provider for production.");
    }

    public Task CompleteMultipartUploadAsync(string key, string uploadId, List<UploadPartInfo> parts, CancellationToken ct)
    {
        throw new NotSupportedException("LocalFileStorageService does not support multipart uploads. Use S3 provider for production.");
    }

    public Task AbortMultipartUploadAsync(string key, string uploadId, CancellationToken ct)
    {
        throw new NotSupportedException("LocalFileStorageService does not support multipart uploads. Use S3 provider for production.");
    }

    public async Task<string> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken ct)
    {
        var fullPath = GetFullPath(fileName);
        var directory = Path.GetDirectoryName(fullPath);

        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        _logger.LogInformation("Saving file to {Path}", fullPath);

        await using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, true);
        await stream.CopyToAsync(fileStream, ct);

        return fileName;
    }

    public Task<Stream> OpenReadAsync(string path, CancellationToken ct)
    {
        var fullPath = GetFullPath(path);

        if (!File.Exists(fullPath))
        {
            _logger.LogWarning("File not found at {Path}", fullPath);
            throw new FileNotFoundException("File not found", path);
        }

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, true);
        return Task.FromResult<Stream>(stream);
    }

    public Task DeleteAsync(string path, CancellationToken ct)
    {
        var fullPath = GetFullPath(path);

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

    private string GetFullPath(string key)
    {
        var safePath = key.Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar);
        return Path.Combine(_basePath, safePath);
    }
}
