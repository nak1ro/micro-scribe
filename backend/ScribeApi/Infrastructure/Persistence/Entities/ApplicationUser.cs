using Microsoft.AspNetCore.Identity;

namespace ScribeApi.Infrastructure.Persistence.Entities;

public class ApplicationUser : IdentityUser
{
    public PlanType Plan { get; set; } = PlanType.Free;

    public double UsedMinutesThisMonth { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAtUtc { get; set; }

    public bool IsDeleted { get; set; }

    public string? EmailConfirmationToken { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    public ICollection<TranscriptionJob> TranscriptionJobs { get; set; } = new List<TranscriptionJob>();
    public ICollection<MediaFile> MediaFiles { get; set; } = new List<MediaFile>();
    public ICollection<UploadSession> UploadSessions { get; set; } = new List<UploadSession>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}