using System.Diagnostics;
using System.Text.RegularExpressions;
using ScribeApi.Core.Interfaces;

namespace ScribeApi.Infrastructure.MediaProcessing;

public partial class FfmpegMediaService : IFfmpegMediaService
{
    private readonly IFileStorageService _storage;
    private readonly ILogger<FfmpegMediaService> _logger;
    private readonly string _ffmpegPath;
    
    // Hardcoded timeout for now to prevent hangs, could be moved to config
    private static readonly TimeSpan FfmpegTimeout = TimeSpan.FromMinutes(10);

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
        var (tempPath, needsCleanup) = await PrepareInputFileAsync(inputPath, ct);

        try
        {
            // Run ffmpeg simply to get metadata
            var args = $"-i \"{tempPath}\" -hide_banner";
            
            // We expect exit code 1 here because we aren't providing an output file, which is fine for probing.
            // So we don't enforce success exit code.
            var result = await RunFfmpegCommandAsync(args, enforceSuccess: false, ct);
            
            // ffmpeg output for duration is often in stderr
            return ParseDurationFromOutput(result.StdErr + Environment.NewLine + result.StdOut);
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
        var (tempInputPath, needsInputCleanup) = await PrepareInputFileAsync(inputPath, ct);
        var tempOutputPath = GenerateTempOutputPath();

        try
        {
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
            if (needsInputCleanup) CleanupTempFile(tempInputPath);
            CleanupTempFile(tempOutputPath);
        }
    }

    private async Task<(string Path, bool NeedsCleanup)> PrepareInputFileAsync(string inputPath, CancellationToken ct)
    {
        // If it's a storage path (cloud), we need download. Check if file exists locally.
        if (File.Exists(inputPath)) return (inputPath, false);
        
        var tempPath = await DownloadToTempAsync(inputPath, ct);
        return (tempPath, true);
    }

    private async Task<string> DownloadToTempAsync(
        string storagePath, 
        CancellationToken ct)
    {
        var tempFilePath = Path.Combine(
            Path.GetTempPath(), 
            $"input_{Guid.NewGuid():N}{Path.GetExtension(storagePath)}");

        _logger.LogDebug("Downloading {StoragePath} to {TempPath}", storagePath, tempFilePath);

        await using var sourceStream = await _storage.OpenReadAsync(storagePath, ct);
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
        // -vn: disable video
        // -ar 16000: set audio sample rate to 16kHz
        // -ac 1: set audio channels to 1 (mono)
        // -c:a pcm_s16le: set audio codec to PCM signed 16-bit little-endian
        var args = $"-y -i \"{inputPath}\" -vn -ar 16000 -ac 1 -c:a pcm_s16le \"{outputPath}\"";

        _logger.LogInformation("Running ffmpeg extraction");

        var result = await RunFfmpegCommandAsync(args, enforceSuccess: true, ct);

        return ParseDurationFromOutput(result.StdErr);
    }

    private async Task<ProcessResult> RunFfmpegCommandAsync(string arguments, bool enforceSuccess, CancellationToken ct)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = _ffmpegPath,
            Arguments = arguments,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process { StartInfo = startInfo };
        var outputBuilder = new System.Text.StringBuilder();
        var errorBuilder = new System.Text.StringBuilder();

        process.OutputDataReceived += (_, e) => { if (e.Data != null) outputBuilder.AppendLine(e.Data); };
        process.ErrorDataReceived += (_, e) => { if (e.Data != null) errorBuilder.AppendLine(e.Data); };

        try
        {
            if (!process.Start())
            {
                throw new InvalidOperationException($"Failed to start FFmpeg process.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start FFmpeg with args: {Args}", arguments);
            throw;
        }

        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        // Linked token for timeout
        using var timeoutCts = new CancellationTokenSource(FfmpegTimeout);
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(ct, timeoutCts.Token);

        try
        {
            await process.WaitForExitAsync(linkedCts.Token);
        }
        catch (OperationCanceledException)
        {
            try
            {
                if (!process.HasExited)
                {
                    process.Kill(entireProcessTree: true);
                }
            }
            catch (Exception killEx)
            {
                _logger.LogWarning(killEx, "Failed to kill hanging FFmpeg process");
            }

            if (timeoutCts.IsCancellationRequested)
            {
                throw new TimeoutException($"FFmpeg process timed out after {FfmpegTimeout.TotalMinutes} minutes.");
            }
            throw;
        }

        if (enforceSuccess && process.ExitCode != 0)
        {
            var error = errorBuilder.ToString();
            _logger.LogError("FFmpeg failed with exit code {ExitCode}. Error: {Error}", process.ExitCode, error);
            throw new InvalidOperationException($"FFmpeg conversion failed with exit code {process.ExitCode}");
        }

        return new ProcessResult(outputBuilder.ToString(), errorBuilder.ToString(), process.ExitCode);
    }

    private static TimeSpan ParseDurationFromOutput(string ffmpegOutput)
    {
        // FFmpeg writes duration to stderr mostly
        var durationLine = ffmpegOutput
            .Split('\n')
            .FirstOrDefault(line => line.Contains("Duration:"));

        if (durationLine == null) return TimeSpan.Zero;

        var match = DurationRegex().Match(durationLine);
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

        _logger.LogDebug("Uploading audio to storage: {FileName}", audioFileName);

        await using var audioStream = new FileStream(
            tempAudioPath, 
            FileMode.Open, 
            FileAccess.Read, 
            FileShare.Read, 
            4096, 
            true);

        return await _storage.SaveAsync(
            audioStream, 
            audioFileName, 
            "audio/wav", 
            ct);
    }

    private void CleanupTempFile(string? filePath)
    {
        if (string.IsNullOrEmpty(filePath) || !File.Exists(filePath)) return;

        try
        {
            File.Delete(filePath);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to cleanup temp file: {Path}. Error: {Error}", filePath, ex.Message);
        }
    }

    [GeneratedRegex(@"Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d+)")]
    private static partial Regex DurationRegex();

    private record ProcessResult(string StdOut, string StdErr, int ExitCode);
}