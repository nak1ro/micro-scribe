using AutoMapper;
using Microsoft.AspNetCore.Identity;
using ScribeApi.Core.Exceptions;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Auth.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace ScribeApi.Features.Auth.Services;

public class ExternalAuthService : IExternalAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private readonly IOAuthService _oauthService;
    private readonly IAuthQueries _authQueries;
    private readonly ILogger<ExternalAuthService> _logger;

    public ExternalAuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        AppDbContext context,
        IMapper mapper,
        IOAuthService oauthService,
        IAuthQueries authQueries,
        ILogger<ExternalAuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _mapper = mapper;
        _oauthService = oauthService;
        _authQueries = authQueries;
        _logger = logger;
    }

    public async Task<UserDto> ExternalLoginAsync(ExternalAuthRequestDto request, CancellationToken cancellationToken = default)
    {
        var oauthUserInfo = await _oauthService.ValidateGoogleTokenAsync(request.IdToken, cancellationToken);
        return await ProcessExternalLoginFlowAsync(oauthUserInfo, cancellationToken);
    }

    public async Task<UserDto> OAuthCallbackAsync(OAuthCallbackRequestDto request, CancellationToken cancellationToken = default)
    {
        var oauthUserInfo = await _oauthService.ExchangeCodeForTokenAsync(request.Provider, request.Code, cancellationToken);
        return await ProcessExternalLoginFlowAsync(oauthUserInfo, cancellationToken);
    }

    public async Task LinkExternalAccountAsync(string userId, LinkOAuthAccountRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        // Validate the OAuth token
        var oauthUserInfo = await _oauthService.ValidateGoogleTokenAsync(request.IdToken, cancellationToken);

        // Check if this provider account is already linked to another user
        var existingLogin = await _authQueries.GetExternalLoginAsync(oauthUserInfo.Provider, oauthUserInfo.ProviderKey, cancellationToken);

        if (existingLogin != null)
        {
            if (existingLogin.UserId != userId)
            {
                throw new AccountLinkingException("This external account is already linked to another user.");
            }

            // Already linked to this user, just update tokens
            UpdateExternalLoginTokens(existingLogin, oauthUserInfo);
            await _context.SaveChangesAsync(cancellationToken);
            return;
        }

        // Create new external login link
        await CreateExternalLoginAsync(user, oauthUserInfo, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UnlinkExternalAccountAsync(string userId, string provider, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        var externalLogin = await _authQueries.GetExternalLoginByProviderAsync(userId, provider, cancellationToken);

        if (externalLogin == null)
        {
            throw new NotFoundException("External login not found.");
        }

        // Check if user has a password or other login methods
        var hasPassword = await _userManager.HasPasswordAsync(user);
        var otherLoginsCount = await _authQueries.CountOtherExternalLoginsAsync(userId, provider, cancellationToken);

        if (!hasPassword && otherLoginsCount == 0)
        {
            throw new ValidationException(
                "Cannot unlink the only login method. Please set a password first or link another account.");
        }

        _context.ExternalLogins.Remove(externalLogin);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<ExternalLoginDto>> GetLinkedAccountsAsync(string userId, CancellationToken cancellationToken = default)
    {
        var externalLogins = await _authQueries.GetExternalLoginsByUserIdAsync(userId, cancellationToken);

        return externalLogins
            .Select(el => new ExternalLoginDto(
                el.Provider,
                el.ProviderKey,
                el.AccessTokenExpiresAt
            ))
            .ToList();
    }

    private async Task<UserDto> ProcessExternalLoginFlowAsync(OAuthUserInfo oauthUserInfo, CancellationToken cancellationToken)
    {
        var existingLogin = await _authQueries.GetExternalLoginAsync(oauthUserInfo.Provider, oauthUserInfo.ProviderKey, cancellationToken);

        ApplicationUser user;

        if (existingLogin != null)
        {
            user = existingLogin.User;
            UpdateExternalLoginTokens(existingLogin, oauthUserInfo);
        }
        else
        {
            user = await GetOrCreateUserAsync(oauthUserInfo.Email);
            await CreateExternalLoginAsync(user, oauthUserInfo, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Update last login time
        user.LastLoginAtUtc = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);
        
        await _signInManager.SignInAsync(user, isPersistent: true);

        return await MapUserDtoAsync(user);
    }

    private void UpdateExternalLoginTokens(ExternalLogin login, OAuthUserInfo userInfo)
    {
        login.AccessToken = userInfo.AccessToken;
        login.RefreshToken = userInfo.RefreshToken;
        login.AccessTokenExpiresAt = userInfo.AccessTokenExpiresAt;
    }

    private async Task<ApplicationUser> GetOrCreateUserAsync(string email)
    {
        var existingUser = await _userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            return existingUser;
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };

        var createResult = await _userManager.CreateAsync(user);
        if (!createResult.Succeeded)
        {
            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
            throw new ValidationException($"Failed to create user: {errors}");
        }

        await _userManager.AddToRoleAsync(user, AuthConstants.Roles.User);
        return user;
    }

    private async Task CreateExternalLoginAsync(ApplicationUser user, OAuthUserInfo userInfo, CancellationToken cancellationToken)
    {
        var externalLogin = new ExternalLogin
        {
            Id = Guid.NewGuid().ToString(),
            UserId = user.Id,
            User = user,
            Provider = userInfo.Provider,
            ProviderKey = userInfo.ProviderKey,
            AccessToken = userInfo.AccessToken,
            RefreshToken = userInfo.RefreshToken,
            AccessTokenExpiresAt = userInfo.AccessTokenExpiresAt
        };

        await _context.ExternalLogins.AddAsync(externalLogin, cancellationToken);
    }

    private async Task<UserDto> MapUserDtoAsync(ApplicationUser user)
    {
        var userDto = _mapper.Map<UserDto>(user);
        var roles = await _userManager.GetRolesAsync(user);
        return userDto with { Roles = roles.ToList() };
    }
}
