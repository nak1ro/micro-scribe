using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class MediaFileConfiguration : IEntityTypeConfiguration<MediaFile>
{
    public void Configure(EntityTypeBuilder<MediaFile> builder)
    {
        builder.ToTable("MediaFiles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OriginalFileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.ContentType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.OriginalPath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.AudioPath)
            .HasMaxLength(500);

        builder.Property(x => x.FileType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.CreatedAtUtc)
            .HasDefaultValueSql("NOW()");

        builder.HasOne(x => x.User)
            .WithMany(u => u.MediaFiles)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.UserId, x.CreatedAtUtc });
        builder.HasIndex(x => x.FileType);
    }
}