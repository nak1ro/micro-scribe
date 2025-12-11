namespace ScribeApi.Core.Interfaces;

public interface IFileStorageService
{
    // Saves a file to the storage provider.
    Task<string> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken ct);

    // Opens a stream to read a file from storage.
    Task<Stream> OpenReadAsync(string path, CancellationToken ct);

    // Deletes a file from storage.
    Task DeleteAsync(string path, CancellationToken ct);
}
