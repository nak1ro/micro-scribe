using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Entities;

public class TranscriptionAnalysis
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid TranscriptionJobId { get; set; }
    public TranscriptionJob TranscriptionJob { get; set; } = null!;
    
    // "ShortSummary", "ActionItems", "MeetingMinutes", "Tags", "Sentiment"
    public required string AnalysisType { get; set; }
    
    // Content in Source Language
    public required string Content { get; set; }

    // Translations: { "es": "Resumen...", "fr": "Résumé..." }
    // Stored as JSONB
    public Dictionary<string, string> Translations { get; set; } = new();

    public string? ModelUsed { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastUpdatedAtUtc { get; set; }
}
