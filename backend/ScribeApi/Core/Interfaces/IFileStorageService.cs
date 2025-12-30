using ScribeApi.Core.Storage;

namespace ScribeApi.Core.Interfaces;

public interface IFileStorageService
{
    string BucketName { get; }

    // Check if object exists and get metadata
    Task<StorageObjectInfo?> GetObjectInfoAsync(string key, CancellationToken ct);

    // Single-shot presigned PUT URL (for files below multipart threshold)
    Task<PresignedUploadResult> GenerateUploadUrlAsync(string key, string contentType, long sizeBytes,
        CancellationToken ct);

    // Generate a temporary GET URL for downloading/streaming
    Task<string> GenerateDownloadUrlAsync(string key, TimeSpan expiry, CancellationToken ct);

    // Multipart upload operations
    Task<MultipartUploadInitResult> InitiateMultipartUploadAsync(string key, string contentType, long totalSizeBytes,
        CancellationToken ct);

    Task<string> GeneratePartUploadUrlAsync(string key, string uploadId, int partNumber, CancellationToken ct);
    
    // Azure uses part numbers to derive Block IDs; S3 would need ETags but we're Azure-only now
    Task CompleteMultipartUploadAsync(string key, string uploadId, List<int> partNumbers, CancellationToken ct);
    
    Task AbortMultipartUploadAsync(string key, string uploadId, CancellationToken ct);

    // Existing operations
    Task<string> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken ct);
    Task<Stream> OpenReadAsync(string path, CancellationToken ct);
    Task DeleteAsync(string path, CancellationToken ct);
}