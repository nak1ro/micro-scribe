using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class TranscriptionJobConfiguration : IEntityTypeConfiguration<TranscriptionJob>
{
    public void Configure(EntityTypeBuilder<TranscriptionJob> builder)
    {
        builder.ToTable("TranscriptionJobs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Quality)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.SourceLanguage)
            .HasMaxLength(10);

        builder.Property(x => x.ErrorMessage)
            .HasMaxLength(1000);

        builder.Property(x => x.CreatedAtUtc)
            .HasDefaultValueSql("NOW()");

        builder.Property(x => x.Segments)
            .HasColumnType("jsonb");

        builder.Property(x => x.Speakers)
            .HasColumnType("jsonb");

        builder.HasOne(x => x.User)
            .WithMany(u => u.TranscriptionJobs)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.MediaFile)
            .WithMany(m => m.TranscriptionJobs)
            .HasForeignKey(x => x.MediaFileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.UserId, x.CreatedAtUtc });
        builder.HasIndex(x => x.Status);
    }
}