using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class ExternalLoginConfiguration : IEntityTypeConfiguration<ExternalLogin>
{
    public void Configure(EntityTypeBuilder<ExternalLogin> builder)
    {
        builder.HasKey(e => e.Id);

        // Required properties
        builder.Property(e => e.Provider)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.ProviderKey)
            .IsRequired()
            .HasMaxLength(255);

        // Optional token properties
        builder.Property(e => e.AccessToken)
            .HasMaxLength(4000);

        builder.Property(e => e.RefreshToken)
            .HasMaxLength(4000);

        builder.Property(e => e.RawClaimsJson)
            .HasColumnType("text");

        // Foreign key relationship to ApplicationUser
        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique constraint: one provider account can only be linked to one user
        builder.HasIndex(e => new { e.Provider, e.ProviderKey })
            .IsUnique();

        // Index for user lookup
        builder.HasIndex(e => e.UserId);
    }
}
