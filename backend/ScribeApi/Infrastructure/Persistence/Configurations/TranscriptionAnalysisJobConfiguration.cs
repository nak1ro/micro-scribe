using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class TranscriptionAnalysisJobConfiguration : IEntityTypeConfiguration<TranscriptionAnalysisJob>
{
    public void Configure(EntityTypeBuilder<TranscriptionAnalysisJob> builder)
    {
        builder.ToTable("TranscriptionAnalysisJobs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AnalysisType)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(x => x.Translations)
            .HasColumnType("jsonb");

        builder.HasOne(x => x.TranscriptionJob)
            .WithMany(j => j.Analyses)
            .HasForeignKey(x => x.TranscriptionJobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.TranscriptionJobId, x.AnalysisType })
            .IsUnique();
    }
}
