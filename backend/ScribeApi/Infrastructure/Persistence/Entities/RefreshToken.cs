using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScribeApi.Infrastructure.Persistence.Entities;

public class RefreshToken
{
    [Key]
    public int Id { get; set; }

    public string Token { get; set; } = string.Empty;
    public string JwtId { get; set; } = string.Empty;
    public DateTime CreationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool Used { get; set; }
    public bool Invalidated { get; set; }

    public string UserId { get; set; } = string.Empty;
    
    [ForeignKey(nameof(UserId))]
    public ApplicationUser? User { get; set; }
}
