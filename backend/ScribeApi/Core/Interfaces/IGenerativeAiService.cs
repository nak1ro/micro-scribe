namespace ScribeApi.Core.Interfaces;

public interface IGenerativeAiService
{
    Task<string> GenerateTextAsync(string prompt, string contextContent, CancellationToken ct);
}
