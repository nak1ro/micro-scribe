using System.Diagnostics;
using Microsoft.Extensions.Logging;
using ScribeApi.Infrastructure.Storage;

namespace ScribeApi.Infrastructure.ExternalServices;

public partial class FfmpegMediaService : IFfmpegMediaService
{
    private readonly IFileStorageService _storage;
    private readonly ILogger<FfmpegMediaService> _logger;
    private readonly string _ffmpegPath;

    public FfmpegMediaService(
        IFileStorageService storage, 
        ILogger<FfmpegMediaService> logger)
    {
        _storage = storage;
        _logger = logger;
        _ffmpegPath = "ffmpeg"; // Assumes ffmpeg is in PATH
    }

    public async Task<TimeSpan> GetDurationAsync(string inputPath, CancellationToken ct)
    {
        var tempPath = inputPath;
        var needsCleanup = false;

        // If it's a storage path (cloud), we need download. Check if file exists locally.
        if (!File.Exists(inputPath))
        {
             tempPath = await DownloadToTempAsync(inputPath, ct);
             needsCleanup = true;
        }

        try
        {
            // Run ffmpeg simply to get metadata
            var args = $"-i \"{tempPath}\" -hide_banner";
            
            var startInfo = new ProcessStartInfo
            {
                FileName = _ffmpegPath,
                Arguments = args,
                RedirectStandardOutput = true,
                RedirectStandardError = true, // ffmpeg output is usually in stderr
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = startInfo };
            
            var sb = new System.Text.StringBuilder();
            process.ErrorDataReceived += (_, e) => { if (e.Data != null) sb.AppendLine(e.Data); };

            process.Start();
            process.BeginErrorReadLine();
            await process.WaitForExitAsync(ct);

            // Exit code might be 1 because we didn't specify output, that's fine for probing
            return ParseDurationFromOutput(sb.ToString());
        }
        finally
        {
            if (needsCleanup) CleanupTempFile(tempPath);
        }
    }

    public async Task<FfmpegResult> ConvertToAudioAsync(
        string inputPath, 
        CancellationToken ct)
    {
        var tempInputPath = string.Empty;
        var tempOutputPath = string.Empty;

        try
        {
            tempInputPath = await DownloadToTempAsync(inputPath, ct);
            tempOutputPath = GenerateTempOutputPath();

            var duration = await ExtractAudioAsync(
                tempInputPath, 
                tempOutputPath, 
                ct);

            var audioPath = await UploadAudioAsync(
                tempOutputPath, 
                inputPath, 
                ct);

            _logger.LogInformation(
                "Audio conversion completed: {AudioPath}, Duration: {Duration}s",
                audioPath, 
                duration.TotalSeconds);

            return new FfmpegResult(audioPath, duration);
        }
        finally
        {
            CleanupTempFile(tempInputPath);
            CleanupTempFile(tempOutputPath);
        }
    }

    private async Task<string> DownloadToTempAsync(
        string storagePath, 
        CancellationToken ct)
    {
        var tempFilePath = Path.Combine(
            Path.GetTempPath(), 
            $"input_{Guid.NewGuid():N}{Path.GetExtension(storagePath)}");

        _logger.LogDebug("Downloading {StoragePath} to {TempPath}", 
            storagePath, 
            tempFilePath);

        await using var sourceStream = await _storage.OpenReadAsync(
            storagePath, 
            ct);
        
        await using var fileStream = new FileStream(
            tempFilePath, 
            FileMode.Create, 
            FileAccess.Write, 
            FileShare.None, 
            4096, 
            true);
        
        await sourceStream.CopyToAsync(fileStream, ct);

        return tempFilePath;
    }

    private static string GenerateTempOutputPath()
    {
        return Path.Combine(
            Path.GetTempPath(), 
            $"output_{Guid.NewGuid():N}.wav");
    }

    private async Task<TimeSpan> ExtractAudioAsync(
        string inputPath, 
        string outputPath, 
        CancellationToken ct)
    {
        var args = $"-y -i \"{inputPath}\" -vn -ar 16000 -ac 1 -c:a pcm_s16le \"{outputPath}\"";

        _logger.LogInformation("Running ffmpeg: {Args}", args);

        var startInfo = new ProcessStartInfo
        {
            FileName = _ffmpegPath,
            Arguments = args,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process { StartInfo = startInfo };
        
        var outputBuilder = new System.Text.StringBuilder();
        var errorBuilder = new System.Text.StringBuilder();

        process.OutputDataReceived += (_, e) => 
        {
            if (e.Data != null) outputBuilder.AppendLine(e.Data);
        };
        
        process.ErrorDataReceived += (_, e) => 
        {
            if (e.Data != null) errorBuilder.AppendLine(e.Data);
        };

        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        await process.WaitForExitAsync(ct);

        if (process.ExitCode != 0)
        {
            var error = errorBuilder.ToString();
            _logger.LogError("FFmpeg failed: {Error}", error);
            throw new InvalidOperationException(
                $"FFmpeg conversion failed with exit code {process.ExitCode}");
        }

        var duration = ParseDurationFromOutput(errorBuilder.ToString());
        return duration;
    }

    private static TimeSpan ParseDurationFromOutput(string ffmpegOutput)
    {
        var durationLine = ffmpegOutput
            .Split('\n')
            .FirstOrDefault(line => line.Contains("Duration:"));

        if (durationLine == null)
        {
            return TimeSpan.Zero;
        }

        var match = MyRegex().Match(durationLine);

        if (!match.Success) return TimeSpan.Zero;
        
        var hours = int.Parse(match.Groups[1].Value);
        var minutes = int.Parse(match.Groups[2].Value);
        var seconds = double.Parse(match.Groups[3].Value);

        return TimeSpan.FromHours(hours)
            .Add(TimeSpan.FromMinutes(minutes))
            .Add(TimeSpan.FromSeconds(seconds));

    }

    private async Task<string> UploadAudioAsync(
        string tempAudioPath, 
        string originalPath, 
        CancellationToken ct)
    {
        var audioFileName = $"{Path.GetFileNameWithoutExtension(originalPath)}_audio.wav";

        _logger.LogDebug("Uploading audio to storage: {FileName}", 
            audioFileName);

        await using var audioStream = new FileStream(
            tempAudioPath, 
            FileMode.Open, 
            FileAccess.Read, 
            FileShare.Read, 
            4096, 
            true);

        var audioPath = await _storage.SaveAsync(
            audioStream, 
            audioFileName, 
            "audio/wav", 
            ct);

        return audioPath;
    }

    private void CleanupTempFile(string? filePath)
    {
        if (string.IsNullOrEmpty(filePath) || !File.Exists(filePath))
        {
            return;
        }

        try
        {
            File.Delete(filePath);
            _logger.LogDebug("Cleaned up temp file: {Path}", filePath);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to cleanup temp file: {Path}", filePath);
        }
    }

    [System.Text.RegularExpressions.GeneratedRegex(@"Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d+)")]
    private static partial System.Text.RegularExpressions.Regex MyRegex();
}