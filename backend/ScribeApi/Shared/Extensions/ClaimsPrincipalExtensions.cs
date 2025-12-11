using System.Security.Claims;

namespace ScribeApi.Shared.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetUserId(this ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        var claim = principal.FindFirst(ClaimTypes.NameIdentifier) ?? 
                    principal.FindFirst("sub") ??
                    principal.FindFirst("id");
        
        return claim == null ? string.Empty : claim.Value;
    }
}
