using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class TranscriptionAnalysisConfiguration : IEntityTypeConfiguration<TranscriptionAnalysis>
{
    public void Configure(EntityTypeBuilder<TranscriptionAnalysis> builder)
    {
        builder.ToTable("TranscriptionAnalyses");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AnalysisType)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(x => x.Translations)
            .HasColumnType("jsonb");

        builder.HasOne(x => x.TranscriptionJob)
            .WithMany()
            .HasForeignKey(x => x.TranscriptionJobId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique constraint: One analysis of a type per job (initially, wait, what if we have multiple versions? No, user requested just type)
        // User requested: "ShortSummary", "LongSummary". These are types.
        // But what about "Language"?
        // Wait, my new entity definition treats "Content" as Source Language and "Translations" as dictionary.
        // So ONE row per Type per Job. 
        // e.g. Job 1, Type "ShortSummary" -> Row 1.
        
        builder.HasIndex(x => new { x.TranscriptionJobId, x.AnalysisType })
            .IsUnique();
    }
}
