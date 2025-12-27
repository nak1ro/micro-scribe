using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class FolderConfiguration : IEntityTypeConfiguration<Folder>
{
    public void Configure(EntityTypeBuilder<Folder> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.Color)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Unique folder name per user
        builder.HasIndex(f => new { f.UserId, f.Name })
            .IsUnique();

        // Index for listing user folders
        builder.HasIndex(f => f.UserId);

        builder.HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class FolderTranscriptionJobConfiguration : IEntityTypeConfiguration<FolderTranscriptionJob>
{
    public void Configure(EntityTypeBuilder<FolderTranscriptionJob> builder)
    {
        // Composite primary key
        builder.HasKey(ftj => new { ftj.FolderId, ftj.TranscriptionJobId });

        builder.HasOne(ftj => ftj.Folder)
            .WithMany(f => f.FolderTranscriptionJobs)
            .HasForeignKey(ftj => ftj.FolderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ftj => ftj.TranscriptionJob)
            .WithMany()
            .HasForeignKey(ftj => ftj.TranscriptionJobId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
