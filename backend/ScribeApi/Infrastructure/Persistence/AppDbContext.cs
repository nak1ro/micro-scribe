using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<TranscriptionJob> TranscriptionJobs => Set<TranscriptionJob>();
    // TranscriptSegments is now part of TranscriptionJob (JSONB)
    public DbSet<TranscriptChapter> TranscriptChapters => Set<TranscriptChapter>();
    public DbSet<UploadSession> UploadSessions => Set<UploadSession>();
    public DbSet<WebhookSubscription> WebhookSubscriptions => Set<WebhookSubscription>();
    public DbSet<WebhookDelivery> WebhookDeliveries => Set<WebhookDelivery>();
    public DbSet<Folder> Folders => Set<Folder>();
    public DbSet<FolderTranscriptionJob> FolderTranscriptionJobs => Set<FolderTranscriptionJob>();
    public DbSet<TranscriptionAnalysisJob> TranscriptionAnalysisJobs => Set<TranscriptionAnalysisJob>();
    public DbSet<ExternalLogin> ExternalLogins => Set<ExternalLogin>();
    public DbSet<ProcessedStripeEvent> ProcessedStripeEvents => Set<ProcessedStripeEvent>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        
        builder.Entity<ApplicationUser>()
            .HasIndex(u => u.Email)
            .IsUnique();

        builder.Entity<UploadSession>()
            .HasIndex(s => new { s.UserId, s.ClientRequestId })
            .IsUnique()
            .HasFilter("\"ClientRequestId\" IS NOT NULL");

        builder.Entity<UploadSession>()
            .Property(s => s.xmin)
            .IsRowVersion();

        // ProcessedStripeEvent - string primary key, index for cleanup
        builder.Entity<ProcessedStripeEvent>(e =>
        {
            e.HasKey(p => p.EventId);
            e.HasIndex(p => p.ProcessedAtUtc);
        });
    }
}