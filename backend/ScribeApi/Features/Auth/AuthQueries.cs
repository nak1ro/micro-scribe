using Microsoft.EntityFrameworkCore;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Auth;

public class AuthQueries : IAuthQueries
{
    private readonly AppDbContext _context;

    public AuthQueries(AppDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken?> GetRefreshTokenByTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.Token == token);
    }

    public async Task<List<RefreshToken>> GetRefreshTokensByUserIdAsync(string userId)
    {
        return await _context.RefreshTokens
            .Where(x => x.UserId == userId)
            .ToListAsync();
    }

    public async Task<ExternalLogin?> GetExternalLoginAsync(string provider, string key)
    {
        return await _context.ExternalLogins
            .Include(el => el.User)
            .FirstOrDefaultAsync(el =>
                el.Provider == provider &&
                el.ProviderKey == key);
    }

    public async Task<List<ExternalLogin>> GetExternalLoginsByUserIdAsync(string userId)
    {
        return await _context.ExternalLogins
            .Where(el => el.UserId == userId)
            .ToListAsync();
    }

    public async Task<ExternalLogin?> GetExternalLoginByProviderAsync(string userId, string provider)
    {
        return await _context.ExternalLogins
            .FirstOrDefaultAsync(el => el.UserId == userId && el.Provider == provider);
    }

    public async Task<int> CountOtherExternalLoginsAsync(string userId, string provider)
    {
        return await _context.ExternalLogins
            .CountAsync(el => el.UserId == userId && el.Provider != provider);
    }
}