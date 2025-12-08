using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        // Map Plan enum as string
        builder.Property(u => u.Plan)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(u => u.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(u => u.CreatedAtUtc)
            .HasDefaultValueSql("NOW()"); // adjust to your DB provider if needed

        // Indexes for common queries
        builder.HasIndex(u => u.Plan);
        builder.HasIndex(u => u.IsDeleted);
        builder.HasIndex(u => u.CreatedAtUtc);
    }
}