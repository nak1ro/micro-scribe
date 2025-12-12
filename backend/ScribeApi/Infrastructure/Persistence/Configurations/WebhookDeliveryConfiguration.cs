using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence.Configurations;

public class WebhookDeliveryConfiguration : IEntityTypeConfiguration<WebhookDelivery>
{
    public void Configure(EntityTypeBuilder<WebhookDelivery> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Event)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Payload)
            .IsRequired();

        builder.Property(x => x.ResponseBody)
            .HasMaxLength(4000);

        builder.HasOne(x => x.Subscription)
            .WithMany(s => s.Deliveries)
            .HasForeignKey(x => x.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.Status, x.NextRetryAtUtc });
        builder.HasIndex(x => x.SubscriptionId);
    }
}
