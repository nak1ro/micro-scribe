using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Exceptions;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Services;

public class TranscriptExportService : ITranscriptExportService
{
    private readonly AppDbContext _context;

    public TranscriptExportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ExportResult> ExportAsync(Guid jobId, string userId, ExportFormat format, CancellationToken ct)
    {
        var job = await _context.TranscriptionJobs
            .Include(j => j.Segments.OrderBy(s => s.Order))
            .Include(j => j.MediaFile)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId, ct);

        if (job == null)
            throw new NotFoundException("Transcription job not found.");

        if (job.Status != TranscriptionJobStatus.Completed)
            throw new ValidationException("Cannot export: transcription is not completed.");

        var baseName = Path.GetFileNameWithoutExtension(job.MediaFile.OriginalFileName);

        return format switch
        {
            ExportFormat.Srt => GenerateSrt(job, baseName),
            ExportFormat.Vtt => GenerateVtt(job, baseName),
            ExportFormat.Txt => GenerateTxt(job, baseName),
            ExportFormat.Json => GenerateJson(job, baseName),
            _ => throw new ValidationException($"Unsupported export format: {format}")
        };
    }

    private static ExportResult GenerateSrt(TranscriptionJob job, string baseName)
    {
        var sb = new StringBuilder();
        var index = 1;

        foreach (var segment in job.Segments)
        {
            sb.AppendLine(index.ToString());
            sb.AppendLine($"{FormatSrtTime(segment.StartSeconds)} --> {FormatSrtTime(segment.EndSeconds)}");
            sb.AppendLine(segment.Text.Trim());
            sb.AppendLine();
            index++;
        }

        return new ExportResult(
            Encoding.UTF8.GetBytes(sb.ToString()),
            "application/x-subrip",
            $"{baseName}.srt"
        );
    }

    private static ExportResult GenerateVtt(TranscriptionJob job, string baseName)
    {
        var sb = new StringBuilder();
        sb.AppendLine("WEBVTT");
        sb.AppendLine();

        foreach (var segment in job.Segments)
        {
            sb.AppendLine($"{FormatVttTime(segment.StartSeconds)} --> {FormatVttTime(segment.EndSeconds)}");
            sb.AppendLine(segment.Text.Trim());
            sb.AppendLine();
        }

        return new ExportResult(
            Encoding.UTF8.GetBytes(sb.ToString()),
            "text/vtt",
            $"{baseName}.vtt"
        );
    }

    private static ExportResult GenerateTxt(TranscriptionJob job, string baseName)
    {
        var content = job.Transcript ?? string.Join(" ", job.Segments.Select(s => s.Text.Trim()));

        return new ExportResult(
            Encoding.UTF8.GetBytes(content),
            "text/plain",
            $"{baseName}.txt"
        );
    }

    private static ExportResult GenerateJson(TranscriptionJob job, string baseName)
    {
        var exportData = new
        {
            jobId = job.Id,
            language = job.LanguageCode,
            durationSeconds = job.DurationSeconds,
            transcript = job.Transcript,
            segments = job.Segments.Select(s => new
            {
                id = s.Id,
                text = s.Text,
                startSeconds = s.StartSeconds,
                endSeconds = s.EndSeconds,
                speaker = s.Speaker,
                isEdited = s.IsEdited
            })
        };

        var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions { WriteIndented = true });

        return new ExportResult(
            Encoding.UTF8.GetBytes(json),
            "application/json",
            $"{baseName}.json"
        );
    }

    private static string FormatSrtTime(double seconds)
    {
        var ts = TimeSpan.FromSeconds(seconds);
        return $"{(int)ts.TotalHours:00}:{ts.Minutes:00}:{ts.Seconds:00},{ts.Milliseconds:000}";
    }

    private static string FormatVttTime(double seconds)
    {
        var ts = TimeSpan.FromSeconds(seconds);
        return $"{(int)ts.TotalHours:00}:{ts.Minutes:00}:{ts.Seconds:00}.{ts.Milliseconds:000}";
    }
}
