using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage.Sas;
using Microsoft.Extensions.Options;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Interfaces;
using ScribeApi.Core.Storage;

namespace ScribeApi.Infrastructure.Storage;

public class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly AzureBlobSettings _settings;
    private readonly StorageSettings _storageSettings;
    private readonly ILogger<AzureBlobStorageService> _logger;
    private BlobContainerClient? _containerClient;

    public AzureBlobStorageService(
        IOptions<AzureBlobSettings> settings,
        IOptions<StorageSettings> storageSettings,
        ILogger<AzureBlobStorageService> logger)
    {
        _settings = settings.Value;
        _storageSettings = storageSettings.Value;
        _logger = logger;
        _blobServiceClient = new BlobServiceClient(_settings.ConnectionString);
    }

    public string BucketName => _settings.ContainerName;

    private async Task<BlobContainerClient> GetContainerClientAsync(CancellationToken ct)
    {
        if (_containerClient != null) return _containerClient;

        _containerClient = _blobServiceClient.GetBlobContainerClient(_settings.ContainerName);
        await _containerClient.CreateIfNotExistsAsync(cancellationToken: ct);
        return _containerClient;
    }

    public async Task<StorageObjectInfo?> GetObjectInfoAsync(string key, CancellationToken ct)
    {
        var container = await GetContainerClientAsync(ct);
        var blobClient = container.GetBlobClient(key);

        try
        {
            var properties = await blobClient.GetPropertiesAsync(cancellationToken: ct);
            return new StorageObjectInfo(
                key, 
                properties.Value.ContentLength, 
                properties.Value.ETag.ToString(), 
                properties.Value.LastModified.UtcDateTime
            );
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }

    public async Task<PresignedUploadResult> GenerateUploadUrlAsync(string key, string contentType, long sizeBytes, CancellationToken ct)
    {
        var container = await GetContainerClientAsync(ct);
        var blobClient = container.GetBlobClient(key);
        var expiry = DateTimeOffset.UtcNow.AddMinutes(_storageSettings.PresignedUrlExpiryMinutes);

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _settings.ContainerName,
            BlobName = key,
            Resource = "b",
            ExpiresOn = expiry,
            Protocol = SasProtocol.Https
        };
        
        sasBuilder.SetPermissions(BlobSasPermissions.Write);
        
        // Note: Content-Type can be enforced via headers but usually SAS just gives permission
        // To enforce content type on upload, clients should set x-ms-blob-content-type header

        var sasUri = blobClient.GenerateSasUri(sasBuilder);
        
        _logger.LogDebug("Generated SAS URL for key {Key}", key);

        return new PresignedUploadResult(sasUri.ToString(), key, expiry.UtcDateTime);
    }

    public async Task<string> GenerateDownloadUrlAsync(string key, TimeSpan expiry, CancellationToken ct)
    {
        var container = await GetContainerClientAsync(ct);
        var blobClient = container.GetBlobClient(key);
        var expiresOn = DateTimeOffset.UtcNow.Add(expiry);

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _settings.ContainerName,
            BlobName = key,
            Resource = "b",
            ExpiresOn = expiresOn,
            Protocol = SasProtocol.Https
        };
        
        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        var sasUri = blobClient.GenerateSasUri(sasBuilder);
        return sasUri.ToString();
    }

    // Azure doesn't have an explicit initiate call for Block Blobs, but we need to return a result compatible with the interface.
    // We'll use the key itself as the UploadId for tracking (or we could just ignore UploadId since it's identifying the blob anyway).
    public Task<MultipartUploadInitResult> InitiateMultipartUploadAsync(string key, string contentType, long totalSizeBytes, CancellationToken ct)
    {
        // Calculate parts
        var totalParts = (int)Math.Ceiling((double)totalSizeBytes / _storageSettings.PartSizeBytes);
        
        // For Azure, UploadId isn't strictly needed like S3, but we pass the key as ID to keep it simple.
        var uploadId = key; 

        _logger.LogInformation("Initiated virtual multipart upload for {Key} with {TotalParts} parts", key, totalParts);

        return Task.FromResult(new MultipartUploadInitResult(uploadId, key, _storageSettings.PartSizeBytes, totalParts));
    }

    public async Task<string> GeneratePartUploadUrlAsync(string key, string uploadId, int partNumber, CancellationToken ct)
    {
        var container = await GetContainerClientAsync(ct);
        var blobClient = container.GetBlockBlobClient(key); // Must use BlockBlobClient
        var expiry = DateTimeOffset.UtcNow.AddMinutes(_storageSettings.PresignedUrlExpiryMinutes);

        // Generate a Block ID based on part number.
        // It must be Base64 encoded and all blocks must have IDs of the same length.
        var blockId = GenerateBlockId(partNumber);
        
        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _settings.ContainerName,
            BlobName = key,
            Resource = "b",
            ExpiresOn = expiry,
            Protocol = SasProtocol.Https
        };
        
        sasBuilder.SetPermissions(BlobSasPermissions.Write);

        // Azure Blob SAS URI for valid SAS token
        var sasUri = blobClient.GenerateSasUri(sasBuilder);
        
        // Append comp=block and blockid to the URI
        var uriBuilder = new UriBuilder(sasUri);
        var query = System.Web.HttpUtility.ParseQueryString(uriBuilder.Query);
        query["comp"] = "block";
        query["blockid"] = blockId;
        uriBuilder.Query = query.ToString();

        _logger.LogDebug("Generated SAS URL for part {PartNumber} (BlockId: {BlockId})", partNumber, blockId);

        return uriBuilder.ToString();
    }

    public async Task CompleteMultipartUploadAsync(string key, string uploadId, List<UploadPartInfo> parts, CancellationToken ct)
    {
        var container = await GetContainerClientAsync(ct);
        var blobClient = container.GetBlockBlobClient(key);

        // Convert parts to block IDs
        var blockIds = parts.OrderBy(p => p.PartNumber).Select(p => GenerateBlockId(p.PartNumber)).ToList();

        await blobClient.CommitBlockListAsync(blockIds, cancellationToken: ct);
        
        _logger.LogInformation("Committed block list for {Key} with {Count} blocks", key, blockIds.Count);
    }

    public async Task AbortMultipartUploadAsync(string key, string uploadId, CancellationToken ct)
    {
        // Uncommitted blocks are garbage collected by Azure after 7 days via lifecycle management if not committed.
        // There is no explicit "abort" API for block lists that clears them immediately other than deleting the blob, 
        // but if the blob doesn't exist yet (because no block list committed), delete might fail or do nothing.
        // We can check if it exists and delete.
        
        var container = await GetContainerClientAsync(ct);
        var blobClient = container.GetBlobClient(key);
        
        await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, cancellationToken: ct);
        _logger.LogInformation("Aborted upload for {Key} (deleted blob/uncommitted blocks)", key);
    }

    public async Task<string> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken ct)
    {
        var container = await GetContainerClientAsync(ct);
        var blobClient = container.GetBlobClient(fileName);

        var headers = new BlobHttpHeaders { ContentType = contentType };
        await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = headers }, cancellationToken: ct);

        _logger.LogInformation("Uploaded file to Azure Blob: {Key}", fileName);
        return fileName;
    }

    public async Task<Stream> OpenReadAsync(string path, CancellationToken ct)
    {
        var container = await GetContainerClientAsync(ct);
        var blobClient = container.GetBlobClient(path);

        var response = await blobClient.OpenReadAsync(cancellationToken: ct);
        return response;
    }

    public async Task DeleteAsync(string path, CancellationToken ct)
    {
         var container = await GetContainerClientAsync(ct);
         var blobClient = container.GetBlobClient(path);
         await blobClient.DeleteIfExistsAsync(cancellationToken: ct);
         _logger.LogInformation("Deleted file from Azure Blob: {Key}", path);
    }

    private static string GenerateBlockId(int partNumber)
    {
        // Block ID must be Base64 string of up to 64 bytes. All Block IDs for a blob must be same length.
        // We use 6 digits for part number padded with zeros: 000001, 000002...
        var rawId = partNumber.ToString("D6");
        var bytes = System.Text.Encoding.UTF8.GetBytes(rawId);
        return Convert.ToBase64String(bytes);
    }
}
