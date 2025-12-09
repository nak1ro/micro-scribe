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

    public async Task<RefreshToken?> GetRefreshTokenByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.RefreshTokens
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.Token == token, cancellationToken);
    }

    public async Task<List<RefreshToken>> GetRefreshTokensByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _context.RefreshTokens
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<ExternalLogin?> GetExternalLoginAsync(string provider, string key, CancellationToken cancellationToken = default)
    {
        return await _context.ExternalLogins
            .Include(el => el.User)
            .FirstOrDefaultAsync(el =>
                el.Provider == provider &&
                el.ProviderKey == key, cancellationToken);
    }

    public async Task<List<ExternalLogin>> GetExternalLoginsByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _context.ExternalLogins
            .Where(el => el.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<ExternalLogin?> GetExternalLoginByProviderAsync(string userId, string provider, CancellationToken cancellationToken = default)
    {
        return await _context.ExternalLogins
            .FirstOrDefaultAsync(el => el.UserId == userId && el.Provider == provider, cancellationToken);
    }

    public async Task<int> CountOtherExternalLoginsAsync(string userId, string provider, CancellationToken cancellationToken = default)
    {
        return await _context.ExternalLogins
            .CountAsync(el => el.UserId == userId && el.Provider != provider, cancellationToken);
    }
}