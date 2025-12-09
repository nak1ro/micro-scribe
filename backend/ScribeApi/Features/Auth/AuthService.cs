using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ScribeApi.Common.Configuration;
using ScribeApi.Common.Exceptions;
using ScribeApi.Common.Interfaces;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtSettings _jwtSettings;
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly IOAuthService _oauthService;
    private readonly IAuthQueries _authQueries;

    public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager,
        JwtSettings jwtSettings, AppDbContext context, IMapper mapper, IEmailService emailService,
        IOAuthService oauthService, IAuthQueries authQueries)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtSettings = jwtSettings;
        _context = context;
        _mapper = mapper;
        _emailService = emailService;
        _oauthService = oauthService;
        _authQueries = authQueries;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new ConflictException("User with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ValidationException($"Registration failed: {errors}");
        }

        await _userManager.AddToRoleAsync(user, "User");

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        user.EmailConfirmationToken = token;
        await _userManager.UpdateAsync(user);

        await _emailService.SendEmailConfirmationAsync(user.Email!, token);

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            throw new AuthenticationException("Invalid email or password.");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            throw new AuthenticationException("Invalid email or password.");
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        var storedToken = await _authQueries.GetRefreshTokenByTokenAsync(request.RefreshToken);

        ValidateRefreshTokenStatus(storedToken);

        storedToken!.Used = true;
        _context.RefreshTokens.Update(storedToken);
        await _context.SaveChangesAsync();

        var user = storedToken.User;
        if (user == null)
        {
            throw new AuthenticationException("User not found.");
        }

        return await GenerateAuthResponseAsync(user);
    }

    private void ValidateRefreshTokenStatus(RefreshToken? storedToken)
    {
        if (storedToken == null)
        {
            throw new AuthenticationException("Invalid refresh token.");
        }

        if (storedToken.ExpiryDate < DateTime.UtcNow)
        {
            throw new AuthenticationException("Refresh token has expired.");
        }

        if (storedToken.Invalidated)
        {
            throw new AuthenticationException("Refresh token has been invalidated.");
        }

        if (storedToken.Used)
        {
            throw new AuthenticationException("Refresh token has already been used.");
        }
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // Don't reveal that the user doesn't exist
            return;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // Token valid for 1 hour
        await _userManager.UpdateAsync(user);

        await _emailService.SendPasswordResetAsync(user.Email!, token);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        if (user.PasswordResetToken != request.Token || user.PasswordResetTokenExpiry < DateTime.UtcNow)
        {
            throw new ValidationException("Invalid or expired password reset token.");
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ValidationException($"Password reset failed: {errors}");
        }

        // Clear the token
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        await _userManager.UpdateAsync(user);
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ValidationException($"Password change failed: {errors}");
        }
    }

    public async Task ConfirmEmailAsync(string userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (!result.Succeeded)
        {
            throw new ValidationException("Email confirmation failed.");
        }

        user.EmailConfirmationToken = null;
        await _userManager.UpdateAsync(user);
    }

    public async Task RevokeTokenAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return;

        // Invalidate all refresh tokens for the user
        var tokens = await _authQueries.GetRefreshTokensByUserIdAsync(userId);
        foreach (var token in tokens)
        {
            token.Invalidated = true;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<AuthResponseDto> ExternalLoginAsync(ExternalAuthRequestDto request)
    {
        var oauthUserInfo = await _oauthService.ValidateGoogleTokenAsync(request.IdToken);
        return await ProcessExternalLoginFlowAsync(oauthUserInfo);
    }

    public async Task<AuthResponseDto> OAuthCallbackAsync(OAuthCallbackRequestDto request)
    {
        var oauthUserInfo = await _oauthService.ExchangeCodeForTokenAsync(request.Provider, request.Code);
        return await ProcessExternalLoginFlowAsync(oauthUserInfo);
    }
    
    // Shared private method to handle the common flow after getting user info from provider
    private async Task<AuthResponseDto> ProcessExternalLoginFlowAsync(OAuthUserInfo oauthUserInfo)
    {
        var existingLogin = await _authQueries.GetExternalLoginAsync(oauthUserInfo.Provider, oauthUserInfo.ProviderKey);

        ApplicationUser user;

        if (existingLogin != null)
        {
            user = existingLogin.User;
            UpdateExternalLoginTokens(existingLogin, oauthUserInfo);
        }
        else
        {
            user = await GetOrCreateUserAsync(oauthUserInfo.Email);
            await CreateExternalLoginAsync(user, oauthUserInfo);
        }
        
        await _context.SaveChangesAsync();

        // Update last login time
        user.LastLoginAtUtc = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return await GenerateAuthResponseAsync(user);
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

        await _userManager.AddToRoleAsync(user, "User");
        return user;
    }

    private async Task CreateExternalLoginAsync(ApplicationUser user, OAuthUserInfo userInfo)
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

        await _context.ExternalLogins.AddAsync(externalLogin);
    }

    public async Task LinkExternalAccountAsync(string userId, LinkOAuthAccountRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        // Validate the OAuth token
        var oauthUserInfo = await _oauthService.ValidateGoogleTokenAsync(request.IdToken);

        // Check if this provider account is already linked to another user
        var existingLogin = await _authQueries.GetExternalLoginAsync(oauthUserInfo.Provider, oauthUserInfo.ProviderKey);

        if (existingLogin != null)
        {
            if (existingLogin.UserId != userId)
            {
                throw new AccountLinkingException("This external account is already linked to another user.");
            }

            // Already linked to this user, just update tokens
            UpdateExternalLoginTokens(existingLogin, oauthUserInfo);
            await _context.SaveChangesAsync();
            return;
        }

        // Create new external login link
        await CreateExternalLoginAsync(user, oauthUserInfo);
        await _context.SaveChangesAsync(); // Need to save explicitly here as CreateExternalLoginAsync only Adds to context
    }

    public async Task<List<ExternalLoginDto>> GetLinkedAccountsAsync(string userId)
    {
        var externalLogins = await _authQueries.GetExternalLoginsByUserIdAsync(userId);

        return externalLogins
            .Select(el => new ExternalLoginDto(
                el.Provider,
                el.ProviderKey,
                el.AccessTokenExpiresAt
            ))
            .ToList();
    }

    public async Task UnlinkExternalAccountAsync(string userId, string provider)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        var externalLogin = await _authQueries.GetExternalLoginByProviderAsync(userId, provider);

        if (externalLogin == null)
        {
            throw new NotFoundException("External login not found.");
        }

        // Check if user has a password or other login methods
        var hasPassword = await _userManager.HasPasswordAsync(user);
        var otherLoginsCount = await _authQueries.CountOtherExternalLoginsAsync(userId, provider);

        if (!hasPassword && otherLoginsCount == 0)
        {
            throw new ValidationException(
                "Cannot unlink the only login method. Please set a password first or link another account.");
        }

        _context.ExternalLogins.Remove(externalLogin);
        await _context.SaveChangesAsync();
    }

    public async Task<UserDto> GetUserByIdAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        var userDto = _mapper.Map<UserDto>(user);
        var roles = await _userManager.GetRolesAsync(user);
        return userDto with { Roles = roles.ToList() };
    }

    private async Task<AuthResponseDto> GenerateAuthResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = GenerateAccessToken(user, roles);
        var refreshToken = await GenerateRefreshTokenAsync(user, accessToken.Id); 

        var userDto = _mapper.Map<UserDto>(user);
        userDto = userDto with { Roles = roles.ToList() };

        return new AuthResponseDto(
            accessToken.Value,
            refreshToken,
            _jwtSettings.ExpiryMinutes * 60,
            "Bearer",
            userDto
        );
    }
    
    private (string Value, string Id) GenerateAccessToken(ApplicationUser user, IList<string> roles)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
        
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new("id", user.Id)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
            SigningCredentials =
                new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return (tokenHandler.WriteToken(token), token.Id);
    }

    private async Task<string> GenerateRefreshTokenAsync(ApplicationUser user, string jwtId)
    {
        var refreshToken = new RefreshToken
        {
            JwtId = jwtId,
            UserId = user.Id,
            CreationDate = DateTime.UtcNow,
            ExpiryDate = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays),
            Token = Guid.NewGuid().ToString()
        };

        await _context.RefreshTokens.AddAsync(refreshToken);
        await _context.SaveChangesAsync();

        return refreshToken.Token;
    }
}