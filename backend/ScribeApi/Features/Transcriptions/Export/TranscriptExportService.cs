using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Domain.Plans;
using ScribeApi.Core.Exceptions;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Export;

public class TranscriptExportService : ITranscriptExportService
{
    private readonly AppDbContext _context;
    private readonly IPlanResolver _planResolver;
    private readonly IPlanGuard _planGuard;
    private readonly IFileStorageService _storageService;

    public TranscriptExportService(
        AppDbContext context,
        IPlanResolver planResolver,
        IPlanGuard planGuard,
        IFileStorageService storageService)
    {
        _context = context;
        _planResolver = planResolver;
        _planGuard = planGuard;
        _storageService = storageService;
    }

    public async Task<ExportResult> ExportAsync(Guid jobId, string userId, ExportFormat format, string? language, CancellationToken ct)
    {
        // Check plan allows this export format
        var user = await _context.Users.OfType<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) throw new NotFoundException("User not found.");
        
        var plan = _planResolver.GetPlanDefinition(user.Plan);
        _planGuard.EnsureExportAllowed(plan, format.ToString());

        var job = await _context.TranscriptionJobs
            .Include(j => j.MediaFile)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId, ct);

        if (job == null)
            throw new NotFoundException("Transcription job not found.");

        if (job.Status != TranscriptionJobStatus.Completed)
            throw new ValidationException("Cannot export: transcription is not completed.");

        // Language Validation
        if (!string.IsNullOrEmpty(language) && !string.Equals(language, job.SourceLanguage, StringComparison.OrdinalIgnoreCase))
        {
            // Check if ANY segment has this translation
            // We check the first segment as a heuristic, or we could check constraints.
            // Assuming if translation was done, all segments have it.
            var hasTranslation = job.Segments.Any(s => s.Translations.ContainsKey(language));
            if (!hasTranslation)
            {
                throw new ValidationException($"Translation for language '{language}' not found.");
            }
        }
        else
        {
            // Reset language to null if it matches source, to treat as original
            language = null;
        }

        var baseName = Path.GetFileNameWithoutExtension(job.MediaFile.OriginalFileName);
        if (!string.IsNullOrEmpty(language))
        {
            baseName += $".{language}";
        }

        return format switch
        {
            ExportFormat.Srt => GenerateSrt(job, baseName, language),
            ExportFormat.Vtt => GenerateVtt(job, baseName, language),
            ExportFormat.Txt => GenerateTxt(job, baseName, language),
            ExportFormat.Json => GenerateJson(job, baseName, language),
            ExportFormat.Csv => GenerateCsv(job, baseName, language),
            ExportFormat.Word => GenerateWord(job, baseName, language),
            ExportFormat.Audio => await GenerateAudioAsync(job, baseName, ct),
            _ => throw new ValidationException($"Unsupported export format: {format}")
        };
    }

    private static string GetText(TranscriptSegment segment, string? language)
    {
        if (!string.IsNullOrEmpty(language) && segment.Translations.TryGetValue(language, out var translated))
        {
            return translated;
        }
        return segment.Text;
    }

    private static ExportResult GenerateSrt(TranscriptionJob job, string baseName, string? language)
    {
        var sb = new StringBuilder();
        var index = 1;

        foreach (var segment in job.Segments)
        {
            var text = GetText(segment, language);
            
            sb.AppendLine(index.ToString());
            sb.AppendLine($"{FormatSrtTime(segment.StartSeconds)} --> {FormatSrtTime(segment.EndSeconds)}");
            sb.AppendLine(text.Trim());
            sb.AppendLine();
            index++;
        }

        return new ExportResult(
            Encoding.UTF8.GetBytes(sb.ToString()),
            "application/x-subrip",
            $"{baseName}.srt"
        );
    }

    private static ExportResult GenerateVtt(TranscriptionJob job, string baseName, string? language)
    {
        var sb = new StringBuilder();
        sb.AppendLine("WEBVTT");
        sb.AppendLine();

        foreach (var segment in job.Segments)
        {
            var text = GetText(segment, language);

            sb.AppendLine($"{FormatVttTime(segment.StartSeconds)} --> {FormatVttTime(segment.EndSeconds)}");
            sb.AppendLine(text.Trim());
            sb.AppendLine();
        }

        return new ExportResult(
            Encoding.UTF8.GetBytes(sb.ToString()),
            "text/vtt",
            $"{baseName}.vtt"
        );
    }

    private static ExportResult GenerateTxt(TranscriptionJob job, string baseName, string? language)
    {
        // If translation, reconstruct from segments. If original, try use job.Transcript
        string content;
        if (!string.IsNullOrEmpty(language))
        {
             content = string.Join(" ", job.Segments.Select(s => GetText(s, language).Trim()));
        }
        else
        {
            content = job.Transcript ?? string.Join(" ", job.Segments.Select(s => s.Text.Trim()));
        }

        return new ExportResult(
            Encoding.UTF8.GetBytes(content),
            "text/plain",
            $"{baseName}.txt"
        );
    }

    private static ExportResult GenerateJson(TranscriptionJob job, string baseName, string? language)
    {
        var exportData = new
        {
            jobId = job.Id,
            language = language ?? job.SourceLanguage,
            durationSeconds = job.DurationSeconds,
            transcript = !string.IsNullOrEmpty(language) 
                ? string.Join(" ", job.Segments.Select(s => GetText(s, language).Trim())) 
                : job.Transcript,
            segments = job.Segments.Select(s => new
            {
                id = s.Id,
                text = GetText(s, language),
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

    private static ExportResult GenerateCsv(TranscriptionJob job, string baseName, string? language)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Start,End,Speaker,Text");

        foreach (var segment in job.Segments)
        {
            var text = GetText(segment, language).Trim().Replace("\"", "\"\"");
            sb.AppendLine($"{segment.StartSeconds:F2},{segment.EndSeconds:F2},{segment.Speaker ?? ""},\"{text}\"");
        }

        return new ExportResult(
            Encoding.UTF8.GetBytes(sb.ToString()),
            "text/csv",
            $"{baseName}.csv"
        );
    }

    private static ExportResult GenerateWord(TranscriptionJob job, string baseName, string? language)
    {
        using var ms = new MemoryStream();
        using (var wordDocument = DocumentFormat.OpenXml.Packaging.WordprocessingDocument.Create(ms, DocumentFormat.OpenXml.WordprocessingDocumentType.Document))
        {
            var mainPart = wordDocument.AddMainDocumentPart();
            mainPart.Document = new DocumentFormat.OpenXml.Wordprocessing.Document();
            var body = mainPart.Document.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.Body());

            // Title
            var titlePara = body.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.Paragraph());
            var titleRun = titlePara.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.Run());
            titleRun.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.RunProperties(new DocumentFormat.OpenXml.Wordprocessing.Bold(), new DocumentFormat.OpenXml.Wordprocessing.FontSize { Val = "32" })); // 16pt
            titleRun.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.Text(baseName));

            // Content
            foreach (var segment in job.Segments)
            {
                var text = GetText(segment, language).Trim();
                var para = body.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.Paragraph());
                var run = para.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.Run());

                if (!string.IsNullOrEmpty(segment.Speaker))
                {
                    var speakerRun = para.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.Run());
                    speakerRun.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.RunProperties(new DocumentFormat.OpenXml.Wordprocessing.Bold()));
                    speakerRun.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.Text($"{segment.Speaker}: "));
                }

                var contentRun = para.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.Run());
                contentRun.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.Text(text));
            }
        }

        return new ExportResult(
            ms.ToArray(),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            $"{baseName}.docx"
        );
    }

    private async Task<ExportResult> GenerateAudioAsync(TranscriptionJob job, string baseName, CancellationToken ct)
    {
        // Audio doesn't change with language
        var key = job.MediaFile.NormalizedAudioObjectKey ?? job.MediaFile.StorageObjectKey;
        if (string.IsNullOrEmpty(key))
            throw new ValidationException("Audio file not available for download.");

        var downloadUrl = await _storageService.GenerateDownloadUrlAsync(key, TimeSpan.FromMinutes(15), ct);

        // Return redirect URL in content (controller will handle redirect)
        return new ExportResult(
            Encoding.UTF8.GetBytes(downloadUrl),
            "audio/redirect",
            $"{baseName}.mp3",
            RedirectUrl: downloadUrl
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
