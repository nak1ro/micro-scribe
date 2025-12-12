using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Interfaces;
using ScribeApi.Core.Storage;

namespace ScribeApi.Infrastructure.Storage;

public class S3MediaStorageService : IFileStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly S3Settings _s3Settings;
    private readonly StorageSettings _storageSettings;
    private readonly ILogger<S3MediaStorageService> _logger;

    public S3MediaStorageService(
        IOptions<S3Settings> s3Settings,
        IOptions<StorageSettings> storageSettings,
        ILogger<S3MediaStorageService> logger)
    {
        _s3Settings = s3Settings.Value;
        _storageSettings = storageSettings.Value;
        _logger = logger;

        var config = new AmazonS3Config { RegionEndpoint = RegionEndpoint.GetBySystemName(_s3Settings.Region) };
        _s3Client = new AmazonS3Client(config);
    }

    public string BucketName => _s3Settings.BucketName;

    public async Task<StorageObjectInfo?> GetObjectInfoAsync(string key, CancellationToken ct)
    {
        try
        {
            var response = await _s3Client.GetObjectMetadataAsync(_s3Settings.BucketName, key, ct);
            return new StorageObjectInfo(key, response.ContentLength, response.ETag, response.LastModified);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public Task<PresignedUploadResult> GenerateUploadUrlAsync(string key, string contentType, long sizeBytes, CancellationToken ct)
    {
        var expiry = DateTime.UtcNow.AddMinutes(_storageSettings.PresignedUrlExpiryMinutes);

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = expiry,
            ContentType = contentType
        };

        var url = _s3Client.GetPreSignedURL(request);

        _logger.LogDebug("Generated presigned PUT URL for key {Key}", key);

        return Task.FromResult(new PresignedUploadResult(url, key, expiry));
    }

    public async Task<MultipartUploadInitResult> InitiateMultipartUploadAsync(string key, string contentType, long totalSizeBytes, CancellationToken ct)
    {
        var request = new InitiateMultipartUploadRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = key,
            ContentType = contentType
        };

        var response = await _s3Client.InitiateMultipartUploadAsync(request, ct);
        var totalParts = (int)Math.Ceiling((double)totalSizeBytes / _storageSettings.PartSizeBytes);

        _logger.LogInformation("Initiated multipart upload {UploadId} for key {Key} with {TotalParts} parts", response.UploadId, key, totalParts);

        return new MultipartUploadInitResult(response.UploadId, key, _storageSettings.PartSizeBytes, totalParts);
    }

    public Task<string> GeneratePartUploadUrlAsync(string key, string uploadId, int partNumber, CancellationToken ct)
    {
        var expiry = DateTime.UtcNow.AddMinutes(_storageSettings.PresignedUrlExpiryMinutes);

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = expiry,
            UploadId = uploadId,
            PartNumber = partNumber
        };

        var url = _s3Client.GetPreSignedURL(request);

        _logger.LogDebug("Generated presigned URL for part {PartNumber} of upload {UploadId}", partNumber, uploadId);

        return Task.FromResult(url);
    }

    public async Task CompleteMultipartUploadAsync(string key, string uploadId, List<UploadPartInfo> parts, CancellationToken ct)
    {
        var request = new CompleteMultipartUploadRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = key,
            UploadId = uploadId,
            PartETags = parts.Select(p => new Amazon.S3.Model.PartETag(p.PartNumber, p.ETag)).ToList()
        };

        await _s3Client.CompleteMultipartUploadAsync(request, ct);

        _logger.LogInformation("Completed multipart upload {UploadId} for key {Key}", uploadId, key);
    }

    public async Task AbortMultipartUploadAsync(string key, string uploadId, CancellationToken ct)
    {
        try
        {
            var request = new AbortMultipartUploadRequest
            {
                BucketName = _s3Settings.BucketName,
                Key = key,
                UploadId = uploadId
            };

            await _s3Client.AbortMultipartUploadAsync(request, ct);

            _logger.LogInformation("Aborted multipart upload {UploadId} for key {Key}", uploadId, key);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogWarning("Multipart upload {UploadId} not found, may already be completed or aborted", uploadId);
        }
    }

    public async Task<string> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken ct)
    {
        var request = new PutObjectRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = fileName,
            InputStream = stream,
            ContentType = contentType
        };

        await _s3Client.PutObjectAsync(request, ct);

        _logger.LogInformation("Saved file to S3: {Key}", fileName);

        return fileName;
    }

    public async Task<Stream> OpenReadAsync(string path, CancellationToken ct)
    {
        var response = await _s3Client.GetObjectAsync(_s3Settings.BucketName, path, ct);
        return response.ResponseStream;
    }

    public async Task DeleteAsync(string path, CancellationToken ct)
    {
        try
        {
            await _s3Client.DeleteObjectAsync(_s3Settings.BucketName, path, ct);
            _logger.LogInformation("Deleted file from S3: {Key}", path);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogWarning("File not found for deletion: {Key}", path);
        }
    }
}