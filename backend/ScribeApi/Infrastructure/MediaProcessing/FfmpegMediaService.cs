using System.Diagnostics;
using System.Text.RegularExpressions;
using ScribeApi.Core.Exceptions;
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

    public async Task<AudioChunkResult> ConvertAndChunkAudioAsync(
        string inputPath,
        TimeSpan chunkDuration,
        TimeSpan chunkThreshold,
        CancellationToken ct)
    {
        var (tempInputPath, needsInputCleanup) = await PrepareInputFileAsync(inputPath, ct);
        var tempChunkDir = Path.Combine(Path.GetTempPath(), $"chunks_{Guid.NewGuid():N}");
        
        try
        {
            // Get duration first to decide if chunking is needed
            var duration = await GetDurationFromFileAsync(tempInputPath, ct);
            
            _logger.LogInformation("Audio duration: {Duration}s, Threshold: {Threshold}s", 
                duration.TotalSeconds, chunkThreshold.TotalSeconds);

            // If under threshold, use single-file conversion
            if (duration <= chunkThreshold)
            {
                var singleResult = await ConvertToAudioAsync(inputPath, ct);
                return new AudioChunkResult(
                    [new AudioChunk(singleResult.AudioPath, TimeSpan.Zero)],
                    singleResult.Duration);
            }

            // Create temp directory for chunks
            Directory.CreateDirectory(tempChunkDir);
            
            var chunks = await SplitAndUploadChunksAsync(
                tempInputPath, 
                tempChunkDir, 
                chunkDuration, 
                duration,
                inputPath,
                ct);

            _logger.LogInformation("Split audio into {Count} chunks", chunks.Count);
            
            return new AudioChunkResult(chunks, duration);
        }
        finally
        {
            if (needsInputCleanup) CleanupTempFile(tempInputPath);
            CleanupTempDirectory(tempChunkDir);
        }
    }

    private async Task<List<AudioChunk>> SplitAndUploadChunksAsync(
        string inputPath,
        string outputDir,
        TimeSpan chunkDuration,
        TimeSpan totalDuration,
        string originalStorageKey,
        CancellationToken ct)
    {
        var outputPattern = Path.Combine(outputDir, "chunk_%03d.mp3");
        
        // FFmpeg segment muxer splits audio into chunks
        var args = $"-y -i \"{inputPath}\" -vn -ar 16000 -ac 1 -c:a libmp3lame -b:a 64k " +
                   $"-f segment -segment_time {(int)chunkDuration.TotalSeconds} \"{outputPattern}\"";

        _logger.LogInformation("Splitting audio into {Duration}s chunks", chunkDuration.TotalSeconds);
        
        await RunFfmpegCommandAsync(args, enforceSuccess: true, ct);

        // Find all generated chunk files and upload them
        var chunkFiles = Directory.GetFiles(outputDir, "chunk_*.mp3")
            .OrderBy(f => f)
            .ToList();

        var chunks = new List<AudioChunk>();
        var baseName = Path.GetFileNameWithoutExtension(originalStorageKey);

        for (var i = 0; i < chunkFiles.Count; i++)
        {
            var chunkFile = chunkFiles[i];
            var startOffset = TimeSpan.FromSeconds(i * chunkDuration.TotalSeconds);
            
            // Upload chunk to storage
            var chunkFileName = $"{baseName}_chunk_{i:D3}.mp3";
            await using var chunkStream = new FileStream(chunkFile, FileMode.Open, FileAccess.Read);
            var storagePath = await _storage.SaveAsync(chunkStream, chunkFileName, "audio/mpeg", ct);
            
            chunks.Add(new AudioChunk(storagePath, startOffset));
            
            _logger.LogDebug("Uploaded chunk {Index}: {Path}, Offset: {Offset}s", 
                i, storagePath, startOffset.TotalSeconds);
        }

        return chunks;
    }

    private async Task<TimeSpan> GetDurationFromFileAsync(string localPath, CancellationToken ct)
    {
        var args = $"-i \"{localPath}\" -hide_banner";
        var result = await RunFfmpegCommandAsync(args, enforceSuccess: false, ct);
        return ParseDurationFromOutput(result.StdErr + Environment.NewLine + result.StdOut);
    }

    private void CleanupTempDirectory(string? dirPath)
    {
        if (string.IsNullOrEmpty(dirPath) || !Directory.Exists(dirPath)) return;

        try
        {
            Directory.Delete(dirPath, recursive: true);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to cleanup temp directory: {Path}. Error: {Error}", dirPath, ex.Message);
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
        // Use MP3 instead of WAV - much smaller file size for Whisper API
        return Path.Combine(
            Path.GetTempPath(), 
            $"output_{Guid.NewGuid():N}.mp3");
    }

    private async Task<TimeSpan> ExtractAudioAsync(
        string inputPath, 
        string outputPath, 
        CancellationToken ct)
    {
        // Optimized for Whisper API (max 25MB):
        // -vn: disable video
        // -ar 16000: 16kHz sample rate (speech doesn't need 44.1kHz)
        // -ac 1: mono (stereo not needed for transcription)
        // -c:a libmp3lame: MP3 codec (much smaller than WAV)
        // -b:a 64k: 64kbps bitrate (good enough for speech)
        // -q:a 4: VBR quality (0-9, 4 is good balance)
        var args = $"-y -i \"{inputPath}\" -vn -ar 16000 -ac 1 -c:a libmp3lame -b:a 64k \"{outputPath}\"";

        _logger.LogInformation("Running ffmpeg extraction to MP3 (16kHz, mono, 64kbps)");

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
                throw new TranscriptionException("FFmpeg failed to start. Ensure FFmpeg is installed and accessible.");
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
                throw new TranscriptionException($"Media processing timed out after {FfmpegTimeout.TotalMinutes} minutes.");
            }
            throw;
        }

        if (enforceSuccess && process.ExitCode != 0)
        {
            var error = errorBuilder.ToString();
            _logger.LogError("FFmpeg failed with exit code {ExitCode}. Error: {Error}", process.ExitCode, error);
            throw new TranscriptionException($"Media conversion failed with FFmpeg exit code {process.ExitCode}.");
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
        var audioFileName = $"{Path.GetFileNameWithoutExtension(originalPath)}_audio.mp3";

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
            "audio/mpeg", 
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