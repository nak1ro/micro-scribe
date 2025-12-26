using System.Text.Json;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Exceptions;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Infrastructure.AI;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Services;

public class AnalysisService : IAnalysisService
{
    private readonly AppDbContext _context;
    private readonly IGenerativeAiService _aiService;
    private readonly ITranslationService _translationService;
    private readonly IMapper _mapper;
    private readonly ILogger<AnalysisService> _logger;
    
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
        ILogger<AnalysisService> logger)
    {
        _context = context;
        _aiService = aiService;
        _translationService = translationService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<List<TranscriptionAnalysisDto>> GenerateAnalysisAsync(
        Guid jobId, 
        string userId, 
        GenerateAnalysisRequest request, 
        CancellationToken ct)
    {
        // Load job data for reading (untracked to avoid concurrency issues)
        var jobData = await _context.TranscriptionJobs
            .AsNoTracking()
            .Where(j => j.Id == jobId && j.UserId == userId)
            .Select(j => new 
            {
                j.Id,
                j.Transcript,
                j.SourceLanguage,
                j.Segments
            })
            .FirstOrDefaultAsync(ct);

        if (jobData == null) throw new NotFoundException($"Job {jobId} not found");
        if (string.IsNullOrEmpty(jobData.Transcript)) throw new ValidationException("Job has no transcript to analyze");

        // Load existing analyses separately (tracked for updates)
        var existingAnalyses = await _context.TranscriptionAnalyses
            .Where(a => a.TranscriptionJobId == jobId)
            .ToListAsync(ct);

        // Expand "All"
        var typesToProcess = request.Types.Contains("All") 
            ? AllTypes 
            : request.Types.Intersect(AllTypes).ToList();

        var sourceLanguage = jobData.SourceLanguage ?? "English";
        
        // Detect additional languages from segments
        var distinctLanguages = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { sourceLanguage };
        
        var sampleSegment = jobData.Segments.FirstOrDefault();
        if (sampleSegment != null)
        {
            foreach (var key in sampleSegment.Translations.Keys)
            {
                distinctLanguages.Add(key);
            }
        }

        foreach (var type in typesToProcess)
        {
            var existing = existingAnalyses.FirstOrDefault(a => a.AnalysisType == type);
            
            // Parallelize generation for all languages
            var generationTasks = distinctLanguages.Select(async lang => 
            {
                var prompt = GetPromptForType(type, lang);
                if (string.IsNullOrEmpty(prompt)) return (Lang: lang, Text: string.Empty);

                try 
                {
                    var text = await _aiService.GenerateTextAsync(prompt, jobData.Transcript, ct);
                    text = CleanAiOutput(text); 
                    return (Lang: lang, Text: text);
                }
                catch (Exception)
                {
                    return (Lang: lang, Text: string.Empty);
                }
            });

            var results = await Task.WhenAll(generationTasks);
            
            var sourceContent = results.FirstOrDefault(x => x.Lang.Equals(sourceLanguage, StringComparison.OrdinalIgnoreCase)).Text;
            var translations = results
                .Where(x => !x.Lang.Equals(sourceLanguage, StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(x.Text))
                .ToDictionary(k => k.Lang, v => v.Text);

            if (string.IsNullOrEmpty(sourceContent)) continue;

            if (existing != null)
            {
                existing.Content = sourceContent;
                existing.ModelUsed = "gpt-4o-mini";
                existing.LastUpdatedAtUtc = DateTime.UtcNow;
                existing.Translations = translations; 
            }
            else
            {
                var analysis = new TranscriptionAnalysis
                {
                    TranscriptionJobId = jobId,
                    AnalysisType = type,
                    Content = sourceContent,
                    ModelUsed = "gpt-4o-mini",
                    Translations = translations
                };
                _context.TranscriptionAnalyses.Add(analysis);
                existingAnalyses.Add(analysis);
            }
        }

        await _context.SaveChangesAsync(ct);
        return MapToDtos(existingAnalyses);
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
        var analyses = await _context.TranscriptionAnalyses
            .Where(a => a.TranscriptionJobId == jobId)
            .ToListAsync(ct);

        if (analyses.Count == 0) return new List<TranscriptionAnalysisDto>();

        foreach (var analysis in analyses)
        {
            if (analysis.Translations.ContainsKey(targetLanguage)) continue;

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

    private List<TranscriptionAnalysisDto> MapToDtos(IEnumerable<TranscriptionAnalysis> entities)
    {
        return entities.Select(e => new TranscriptionAnalysisDto
        {
            Id = e.Id,
            AnalysisType = e.AnalysisType,
            Content = e.Content,
            Translations = e.Translations,
            CreatedAtUtc = e.CreatedAtUtc
        }).ToList();
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
