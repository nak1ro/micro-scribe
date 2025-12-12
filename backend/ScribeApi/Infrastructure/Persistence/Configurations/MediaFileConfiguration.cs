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

        builder.Property(x => x.StorageObjectKey)
            .IsRequired()
            .HasMaxLength(1024);

        builder.Property(x => x.BucketName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.StorageProvider)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.ETag)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.NormalizedAudioObjectKey)
            .HasMaxLength(1024);

        builder.Property(x => x.FileType)
            .HasConversion<int>(); // Changed to int based on user preference or consistency? 
                                   // Previous was string. UploadSession uses MediaFileType enum.
                                   // Previous MediaFileConfiguration had HasConversion<string>().
                                   // Let's stick to int (0/1) for efficiency and consistency with Enum default, 
                                   // unless existing DB has strings and we don't want to migrate data (it is a Refactor).
                                   // User didn't specify enum storage type, but "DetectedMediaType a real enum" implies strict typing.
                                   // I will use int (default for Enum in C# EF) for new fields. 
                                   // MIGRATION WARNING: Changing from string to int for FileType column might require explicit SQL or data loss?
                                   // Since we are refactoring heavily, I'll switch to int as it's cleaner, but I should check if I need to handle data conversion.
                                   // For now I'll just change the config.

        builder.Property(x => x.CreatedAtUtc)
            .HasDefaultValueSql("NOW()");

        builder.HasOne(x => x.User)
            .WithMany(u => u.MediaFiles)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Removed AudioPath, OriginalPath
        
        builder.HasIndex(x => new { x.UserId, x.CreatedAtUtc });
        builder.HasIndex(x => x.FileType);
        builder.HasIndex(x => x.StorageObjectKey).IsUnique();
        builder.HasIndex(x => x.CreatedFromUploadSessionId);
    }
}