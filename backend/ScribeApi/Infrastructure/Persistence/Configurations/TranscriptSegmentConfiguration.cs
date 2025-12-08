using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class TranscriptSegmentConfiguration : IEntityTypeConfiguration<TranscriptSegment>
{
    public void Configure(EntityTypeBuilder<TranscriptSegment> builder)
    {
        builder.ToTable("TranscriptSegments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Text)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(x => x.Speaker)
            .HasMaxLength(100);

        builder.HasOne(x => x.TranscriptionJob)
            .WithMany(j => j.Segments)
            .HasForeignKey(x => x.TranscriptionJobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.TranscriptionJobId, x.Order });
        builder.HasIndex(x => new { x.TranscriptionJobId, x.StartSeconds });
    }
}