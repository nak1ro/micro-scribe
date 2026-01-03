using System.Text.Json;
using AutoMapper;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Exceptions;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Analysis.Contracts;
using ScribeApi.Infrastructure.AI;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Infrastructure.SignalR;

namespace ScribeApi.Features.Analysis.Services;

public class AnalysisService : IAnalysisService
{
    private readonly AppDbContext _context;
    private readonly IGenerativeAiService _aiService;
    private readonly ITranslationService _translationService;
    private readonly IMapper _mapper;
    private readonly ILogger<AnalysisService> _logger;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly IHubContext<TranscriptionHub> _hubContext;
    
    // Available analysis types
    private static readonly List<string> AllTypes = new()
    {
        "ShortSummary",
        "LongSummary",
        "ActionItems",
        "MeetingMinutes",
        "Topics",
        "Sentiment"
    };

    public AnalysisService(
        AppDbContext context,
        IGenerativeAiService aiService,
        ITranslationService translationService,
        IMapper mapper,
        ILogger<AnalysisService> logger,
        IBackgroundJobClient backgroundJobClient,
        IHubContext<TranscriptionHub> hubContext)
    {
        _context = context;
        _aiService = aiService;
        _translationService = translationService;
        _mapper = mapper;
        _logger = logger;
        _backgroundJobClient = backgroundJobClient;
        _hubContext = hubContext;
    }

    public async Task<List<TranscriptionAnalysisDto>> EnqueueAnalysisGenerationAsync(
        Guid jobId, 
        string userId, 
        GenerateAnalysisRequest request, 
        CancellationToken ct)
    {
        // validate job exists
        var jobExists = await _context.TranscriptionJobs
            .AnyAsync(j => j.Id == jobId && j.UserId == userId, ct);

        if (!jobExists) throw new NotFoundException($"Job {jobId} not found");

        // Load existing analyses
        var existingAnalyses = await _context.TranscriptionAnalysisJobs
            .Where(a => a.TranscriptionJobId == jobId)
            .ToListAsync(ct);

        var typesToProcess = request.Types.Contains("All") 
            ? AllTypes 
            : request.Types.Intersect(AllTypes).ToList();
        
        var newJobs = new List<TranscriptionAnalysisJob>();

        foreach (var type in typesToProcess)
        {
            var existing = existingAnalyses.FirstOrDefault(a => a.AnalysisType == type);
            if (existing != null)
            {
                // If failed, maybe reset? For now, skip specific retry logic here, assume new request implies retry if failed?
                // Or just return existing.
                continue; 
            }

            var analysisJob = new TranscriptionAnalysisJob
            {
                TranscriptionJobId = jobId,
                AnalysisType = type,
                Status = AnalysisStatus.Pending,
                Content = null, // Will be filled by background job
                ModelUsed = "gpt-4o-mini"
            };
            
            _context.TranscriptionAnalysisJobs.Add(analysisJob);
            newJobs.Add(analysisJob);
        }

        await _context.SaveChangesAsync(ct);
        
        // Enqueue background jobs
        foreach (var job in newJobs)
        {
            _backgroundJobClient.Enqueue<IAnalysisService>(s => s.ProcessAnalysisJobAsync(jobId, job.Id, CancellationToken.None));
        }
        
        // Merge new and existing for return
        var resultList = existingAnalyses.Concat(newJobs).ToList();
        return MapToDtos(resultList);
    }

    public async Task ProcessAnalysisJobAsync(Guid jobId, Guid analysisJobId, CancellationToken ct)
    {
        var analysisJob = await _context.TranscriptionAnalysisJobs
            .Include(a => a.TranscriptionJob)
            .FirstOrDefaultAsync(a => a.Id == analysisJobId, ct);

        if (analysisJob == null)
        {
            _logger.LogError("Analysis Job {JobId} not found", analysisJobId);
            return;
        }

        var userId = analysisJob.TranscriptionJob.UserId;

        try
        {
            // Update Status to Processing
            analysisJob.Status = AnalysisStatus.Processing;
            await _context.SaveChangesAsync(ct);
            
            // Notify Frontend
            await _hubContext.Clients.Group($"user-{userId}")
                .SendAsync("AnalysisProcessing", MapToDto(analysisJob), ct);

            // Fetch Transcript securely (could be large, read from DB or Storage?) 
            // Currently getting from DB per logic.
            // Re-fetch job data securely
            // Fetch Transcript and Segments for language detection
            // Fetch Transcript and translated languages
            // We don't need Segments anymore, which improves performance
            var jobData = await _context.TranscriptionJobs
                .AsNoTracking()
                .FirstOrDefaultAsync(j => j.Id == jobId, ct);

            if (jobData == null || string.IsNullOrEmpty(jobData.Transcript))
            {
                throw new ValidationException("Transcript not found or empty.");
            }

            var sourceLanguage = jobData.SourceLanguage ?? "English";
            var allLanguages = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            
            // Add source language
            if (!string.IsNullOrWhiteSpace(jobData.SourceLanguage))
            {
                allLanguages.Add(jobData.SourceLanguage);
            }
            else
            {
                allLanguages.Add("English");
            }

            // Add translated languages from property
            if (jobData.TranslatedLanguages != null)
            {
                foreach (var lang in jobData.TranslatedLanguages)
                {
                    allLanguages.Add(lang);
                }
                _logger.LogInformation("Job {JobId}: Detected languages from TranslatedLanguages property: {Langs}", 
                    jobId, string.Join(", ", allLanguages));
            }
            else
            {
               _logger.LogInformation("Job {JobId}: No TranslatedLanguages found (null).", jobId);
            }

            
            // Generate Content for all languages
            var generationTasks = allLanguages.Select(async lang => 
            {
                var prompt = GetPromptForType(analysisJob.AnalysisType, lang);
                if (string.IsNullOrEmpty(prompt)) return (Lang: lang, Text: string.Empty);

                try 
                {
                    var text = await _aiService.GenerateTextAsync(prompt, jobData.Transcript, ct);
                    text = CleanAiOutput(text); 
                    return (Lang: lang, Text: text);
                }
                catch (Exception ex)
                {
                   _logger.LogWarning(ex, "Failed to generate analysis for language {Lang}", lang);
                   return (Lang: lang, Text: string.Empty);
                }
            });

            var results = await Task.WhenAll(generationTasks);
            
            var sourceContent = results.FirstOrDefault(x => x.Lang.Equals(sourceLanguage, StringComparison.OrdinalIgnoreCase)).Text;
            var translations = results
                .Where(x => !x.Lang.Equals(sourceLanguage, StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(x.Text))
                .ToDictionary(k => k.Lang, v => v.Text);

            // Update Completion
            analysisJob.Content = sourceContent;
            analysisJob.Translations = translations;
            analysisJob.Status = AnalysisStatus.Completed;
            analysisJob.LastUpdatedAtUtc = DateTime.UtcNow;
            
            await _context.SaveChangesAsync(ct);
            
            // Notify Frontend
            await _hubContext.Clients.Group($"user-{userId}")
                .SendAsync("AnalysisCompleted", MapToDto(analysisJob), ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process analysis job {AnalysisJobId}", analysisJobId);
            
            analysisJob.Status = AnalysisStatus.Failed;
            
            // Sanitize error message: Only expose messages from known safe domain exceptions
            if (ex is ValidationException or PlanLimitExceededException or RequestTimeoutException)
            {
                analysisJob.ErrorMessage = ex.Message;
            }
            else
            {
                analysisJob.ErrorMessage = "An unexpected error occurred while processing the analysis.";
            }
            
            await _context.SaveChangesAsync(ct);

            await _hubContext.Clients.Group($"user-{userId}")
                .SendAsync("AnalysisFailed", MapToDto(analysisJob), ct);
            
            throw; // Rethrow to let Hangfire handle retry or failure state
        }
    }

    public async Task<List<TranscriptionAnalysisDto>> TranslateAnalysisAsync(
        Guid jobId, 
        string userId, 
        TranslateAnalysisRequest request, 
        CancellationToken ct)
    {
        var job = await _context.TranscriptionJobs
            .Include(j => j.Analyses)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId, ct);

        if (job == null) throw new NotFoundException($"Job {jobId} not found");

        var targetLang = request.TargetLanguage;

        foreach (var analysis in job.Analyses)
        {
            if (analysis.Translations.ContainsKey(targetLang))
                continue; // Already translated
            
            if (string.IsNullOrEmpty(analysis.Content)) continue; // Can't translate empty

            var prompt = AiPrompts.Translate(analysis.Content, targetLang);
            
            // We pass empty context because the content to translate is in the prompt
            var translatedContent = await _aiService.GenerateTextAsync(prompt, "", ct);
            translatedContent = CleanAiOutput(translatedContent);
            
            analysis.Translations[targetLang] = translatedContent;
            analysis.LastUpdatedAtUtc = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(ct);
        return MapToDtos(job.Analyses);
    }

    public async Task<List<TranscriptionAnalysisDto>> TranslateAnalysisWithAzureAsync(
        Guid jobId,
        string userId,
        string sourceLanguage,
        string targetLanguage,
        CancellationToken ct)
    {
        var analyses = await _context.TranscriptionAnalysisJobs
            .Where(a => a.TranscriptionJobId == jobId)
            .ToListAsync(ct);

        if (analyses.Count == 0) return new List<TranscriptionAnalysisDto>();

        foreach (var analysis in analyses)
        {
            if (analysis.Translations.ContainsKey(targetLanguage)) continue;
            if (string.IsNullOrEmpty(analysis.Content)) continue;

            var translatedContent = await TranslateJsonContentAsync(
                analysis.Content, sourceLanguage, targetLanguage, ct);

            analysis.Translations[targetLanguage] = translatedContent;
            analysis.LastUpdatedAtUtc = DateTime.UtcNow;
            
            // Force EF Core to detect JSONB dictionary changes
            _context.Entry(analysis).Property(a => a.Translations).IsModified = true;
        }

        await _context.SaveChangesAsync(ct);
        return MapToDtos(analyses);
    }

    public async Task<List<TranscriptionAnalysisDto>> GetAnalysesAsync(Guid jobId, string userId, CancellationToken ct)
    {
         var job = await _context.TranscriptionJobs
            .Include(j => j.Analyses)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId, ct);

        if (job == null) throw new NotFoundException($"Job {jobId} not found");
        
        return MapToDtos(job.Analyses);
    }

    private string GetPromptForType(string type, string language)
    {
        return type switch
        {
            "ShortSummary" => AiPrompts.ShortSummary(language),
            "LongSummary" => AiPrompts.LongSummary(language),
            "ActionItems" => AiPrompts.ActionItems(language),
            "MeetingMinutes" => AiPrompts.MeetingMinutes(language),
            "Topics" => AiPrompts.Topics(language),
            "Sentiment" => AiPrompts.Sentiment(language),
            _ => string.Empty
        };
    }

    private string CleanAiOutput(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;
        
        // Remove Markdown code blocks if present
        text = text.Replace("```json", "").Replace("```", "");
        
        return text.Trim();
    }

    private List<TranscriptionAnalysisDto> MapToDtos(IEnumerable<TranscriptionAnalysisJob> entities)
    {
        return entities.Select(MapToDto).ToList();
    }

    private TranscriptionAnalysisDto MapToDto(TranscriptionAnalysisJob e)
    {
        return new TranscriptionAnalysisDto
        {
            Id = e.Id,
            AnalysisType = e.AnalysisType,
            Content = e.Content ?? string.Empty,
            Translations = e.Translations,
            CreatedAtUtc = e.CreatedAtUtc,
            Status = e.Status.ToString(),
            ErrorMessage = e.ErrorMessage
        };
    }

    private async Task<string> TranslateJsonContentAsync(
        string jsonContent,
        string sourceLanguage,
        string targetLanguage,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(jsonContent)) return jsonContent;

        try
        {
            var (texts, paths) = ExtractTranslatableTexts(jsonContent);
            if (texts.Count == 0) return jsonContent;

            _logger.LogInformation("Translating {Count} texts from {Source} to {Target}", 
                texts.Count, sourceLanguage, targetLanguage);

            var translatedTexts = await _translationService.TranslateAsync(
                texts, sourceLanguage, targetLanguage, ct);

            return ReconstructJsonWithTranslations(jsonContent, paths, translatedTexts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to translate JSON content from {Source} to {Target}", 
                sourceLanguage, targetLanguage);
            throw;
        }
    }

    private (List<string> texts, List<string> paths) ExtractTranslatableTexts(string json)
    {
        var texts = new List<string>();
        var paths = new List<string>();

        try
        {
            using var doc = JsonDocument.Parse(json);
            ExtractStringsRecursive(doc.RootElement, "", texts, paths);
        }
        catch
        {
            // If not valid JSON, treat entire content as translatable
            texts.Add(json);
            paths.Add("$root");
        }

        return (texts, paths);
    }

    private void ExtractStringsRecursive(JsonElement element, string path, List<string> texts, List<string> paths)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.String:
                var value = element.GetString();
                if (!string.IsNullOrWhiteSpace(value))
                {
                    texts.Add(value);
                    paths.Add(path);
                }
                break;
            case JsonValueKind.Object:
                foreach (var prop in element.EnumerateObject())
                {
                    ExtractStringsRecursive(prop.Value, $"{path}.{prop.Name}", texts, paths);
                }
                break;
            case JsonValueKind.Array:
                int index = 0;
                foreach (var item in element.EnumerateArray())
                {
                    ExtractStringsRecursive(item, $"{path}[{index}]", texts, paths);
                    index++;
                }
                break;
        }
    }

    private string ReconstructJsonWithTranslations(string originalJson, List<string> paths, List<string> translations)
    {
        if (paths.Count == 1 && paths[0] == "$root")
        {
            return translations.Count > 0 ? translations[0] : originalJson;
        }

        try
        {
            using var doc = JsonDocument.Parse(originalJson);
            var pathToTranslation = new Dictionary<string, string>();
            for (int i = 0; i < paths.Count && i < translations.Count; i++)
            {
                pathToTranslation[paths[i]] = translations[i];
            }

            return RebuildJsonWithTranslations(doc.RootElement, "", pathToTranslation);
        }
        catch
        {
            return originalJson;
        }
    }

    private string RebuildJsonWithTranslations(JsonElement element, string path, Dictionary<string, string> translations)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.String:
                var translatedValue = translations.TryGetValue(path, out var t) ? t : element.GetString();
                return JsonSerializer.Serialize(translatedValue);
            case JsonValueKind.Object:
                var objParts = new List<string>();
                foreach (var prop in element.EnumerateObject())
                {
                    var propPath = $"{path}.{prop.Name}";
                    var rebuilt = RebuildJsonWithTranslations(prop.Value, propPath, translations);
                    objParts.Add($"\"{prop.Name}\":{rebuilt}");
                }
                return "{" + string.Join(",", objParts) + "}";
            case JsonValueKind.Array:
                var arrParts = new List<string>();
                int index = 0;
                foreach (var item in element.EnumerateArray())
                {
                    var itemPath = $"{path}[{index}]";
                    arrParts.Add(RebuildJsonWithTranslations(item, itemPath, translations));
                    index++;
                }
                return "[" + string.Join(",", arrParts) + "]";
            default:
                return element.GetRawText();
        }
    }
}
