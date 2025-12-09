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
    public DbSet<TranscriptSegment> TranscriptSegments => Set<TranscriptSegment>();
    public DbSet<TranscriptChapter> TranscriptChapters => Set<TranscriptChapter>();
    public DbSet<UploadSession> UploadSessions => Set<UploadSession>();
    
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<ExternalLogin> ExternalLogins => Set<ExternalLogin>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        
        builder.Entity<ApplicationUser>()
            .HasIndex(u => u.Email)
            .IsUnique();


    }
}