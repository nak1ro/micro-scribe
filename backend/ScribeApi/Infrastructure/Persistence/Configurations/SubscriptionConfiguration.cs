using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("Subscriptions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Plan)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.StripeCustomerId)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.StripeSubscriptionId)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.CreatedAtUtc)
            .HasDefaultValueSql("NOW()");

        builder.HasOne(x => x.User)
            .WithMany(u => u.Subscriptions)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(x => x.StripeSubscriptionId)
            .IsUnique();

        builder.HasIndex(x => x.StripeCustomerId);

        builder.HasIndex(x => new { x.UserId, x.Status });
    }
}