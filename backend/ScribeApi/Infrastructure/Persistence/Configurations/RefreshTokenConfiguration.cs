using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        // Table Name
        builder.ToTable("RefreshTokens");

        // Primary Key
        builder.HasKey(x => x.Id);

        // Properties
        builder.Property(x => x.Token)
            .IsRequired()
            .HasMaxLength(150); 

        builder.Property(x => x.JwtId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.CreationDate)
            .IsRequired();

        builder.Property(x => x.ExpiryDate)
            .IsRequired();

        builder.Property(x => x.Used)
            .IsRequired();

        builder.Property(x => x.Invalidated)
            .IsRequired();

        builder.Property(x => x.UserId)
            .IsRequired()
            .HasMaxLength(450); // Matches IdentityUser ID length

        // Indexes
        builder.HasIndex(x => x.Token)
            .IsUnique();
            
        // Relationships
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
