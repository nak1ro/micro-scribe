using System.Security.Claims;

namespace ScribeApi.Common.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetUserId(this ClaimsPrincipal principal)
    {
        if (principal == null)
            throw new ArgumentNullException(nameof(principal));

        var claim = principal.FindFirst(ClaimTypes.NameIdentifier) ?? 
                    principal.FindFirst("sub") ??
                    principal.FindFirst("id");
        
        if (claim == null)
        {
             // Fallback or throw? For GetUserId in our app, we usually expect it to be there if authorized.
             // But returning string.Empty or null might be safer if not strictly validated yet.
             // However, types usually expect logic. Let's return value or empty.
             return string.Empty;
        }

        return claim.Value;
    }
}
