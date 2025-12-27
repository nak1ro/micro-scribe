using Microsoft.AspNetCore.Identity;

namespace ScribeApi.Infrastructure.Persistence.Entities;

public class ApplicationUser : IdentityUser
{
    // User's subscription plan type
    public PlanType Plan { get; set; } = PlanType.Free;

    // Minutes of transcription used in current billing period
    public double UsedMinutesThisMonth { get; set; }

    // When the user account was created
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Last successful login timestamp
    public DateTime? LastLoginAtUtc { get; set; }

    // Soft delete flag
    public bool IsDeleted { get; set; }


    // Token for password reset flow
    public string? PasswordResetToken { get; set; }

    // Expiry time for password reset token
    public DateTime? PasswordResetTokenExpiry { get; set; }

    // Nav
    public ICollection<TranscriptionJob> TranscriptionJobs { get; set; } = new List<TranscriptionJob>();
    public ICollection<MediaFile> MediaFiles { get; set; } = new List<MediaFile>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}