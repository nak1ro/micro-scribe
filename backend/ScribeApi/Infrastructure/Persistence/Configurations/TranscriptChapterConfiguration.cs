using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class TranscriptChapterConfiguration : IEntityTypeConfiguration<TranscriptChapter>
{
    public void Configure(EntityTypeBuilder<TranscriptChapter> builder)
    {
        builder.ToTable("TranscriptChapters");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasOne(x => x.TranscriptionJob)
            .WithMany(j => j.Chapters)
            .HasForeignKey(x => x.TranscriptionJobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.TranscriptionJobId, x.Order });
        builder.HasIndex(x => new { x.TranscriptionJobId, x.StartSeconds });
    }
}