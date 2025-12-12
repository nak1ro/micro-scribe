namespace ScribeApi.Core.Storage;

// Metadata for a storage object
public record StorageObjectInfo(string Key, long SizeBytes, string? ETag, DateTime? LastModified);

// Result of generating a single-shot presigned upload URL
public record PresignedUploadResult(string UploadUrl, string ObjectKey, DateTime ExpiresAt);

// Result of initiating a multipart upload
public record MultipartUploadInitResult(string UploadId, string ObjectKey, int PartSizeBytes, int TotalParts);

// Completed part info (renamed from PartETag to avoid Amazon SDK conflict)
public record UploadPartInfo(int PartNumber, string ETag);
