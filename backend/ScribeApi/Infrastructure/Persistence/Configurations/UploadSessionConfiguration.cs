using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class UploadSessionConfiguration : IEntityTypeConfiguration<UploadSession>
{
    public void Configure(EntityTypeBuilder<UploadSession> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId)
            .IsRequired()
            .HasMaxLength(450); // Matches IdentityUser ID length

        builder.Property(x => x.ClientRequestId)
            .HasMaxLength(100);

        builder.Property(x => x.CorrelationId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.DeclaredContentType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.DetectedContainerType)
            .HasMaxLength(20);

        builder.Property(x => x.StorageKey)
            .IsRequired()
            .HasMaxLength(1024);

        builder.Property(x => x.UploadId)
            .HasMaxLength(255);

        builder.Property(x => x.ETag)
            .HasMaxLength(255);

        builder.Property(x => x.StorageProvider)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.BucketName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.ErrorMessage)
            .HasMaxLength(2048);
            
        // Status conversion (Enum to Int is default, but explicitly safe)
        builder.Property(x => x.Status)
            .HasConversion<int>();
            
        builder.Property(x => x.DetectedMediaType)
            .HasConversion<int?>();

        // Relationships
        builder.HasOne(x => x.User)
            .WithMany() // No collection on User needed for now, or use mapped one if added
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.MediaFile)
            .WithMany() // One MediaFile comes from one Session (usually)
            .HasForeignKey(x => x.MediaFileId)
            .OnDelete(DeleteBehavior.SetNull); // If MediaFile deleted, keep session? Or Cascade?
                                              // User said "Archive" session. Keep history.
        
        // Indexes
        builder.HasIndex(x => x.StorageKey).IsUnique();
        
        // Unique Index for Idempotency (Moved from DbContext OnModelCreating if desired, or keep both)
        // Keeping logical grouping here is better.
        // builder.HasIndex(s => new { s.UserId, s.ClientRequestId })
        //    .IsUnique()
        //    .HasFilter("\"ClientRequestId\" IS NOT NULL");
        // Note: Filter syntax depends on provider (Postgres uses double quotes). 
        // We already added this in DbContext, so skipping here to avoid duplication/conflict,
        // or we should move it here. I'll leave it in DbContext as I just added it there.
    }
}
