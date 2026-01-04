using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using ScribeApi.Core.Exceptions;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Auth.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Auth.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;
    private readonly IHostEnvironment _env;

    public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager,
        AppDbContext context, IMapper mapper, IEmailService emailService,
        ILogger<AuthService> logger, IHostEnvironment env)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _mapper = mapper;
        _emailService = emailService;
        _logger = logger;
        _env = env;
    }

    public async Task<UserDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new ConflictException("User with this email already exists.");
        }

        var isDev = _env.IsDevelopment();

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = isDev // Auto-confirm in dev
        };

        // Transaction is handled globally by TransactionFilter
        
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ValidationException($"Registration failed: {errors}");
        }

        await _userManager.AddToRoleAsync(user, AuthConstants.Roles.User);

        if (!isDev)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            
            await _emailService.SendEmailConfirmationAsync(user.Email, encodedToken, cancellationToken);
        }
        else
        {
            _logger.LogInformation("Development mode: Email confirmation skipped for {Email}. User auto-confirmed.", user.Email);
        }
        
        // Auto-login
        await _signInManager.SignInAsync(user, isPersistent: true);

        return await MapUserDtoAsync(user);
    }

    public async Task<UserDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            throw new AuthenticationException("Invalid email or password.");
        }

        var result = await _signInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                _logger.LogWarning("User account locked out: {Email}", request.Email);
                throw new AuthenticationException("Account is locked out. Please try again later.");
            }
            
            _logger.LogWarning("Invalid login attempt for user: {Email}", request.Email);
            throw new AuthenticationException("Invalid email or password.");
        }

        return await MapUserDtoAsync(user);
    }
    
    public async Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        await _signInManager.SignOutAsync();
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // Token valid for 1 hour
        await _userManager.UpdateAsync(user);

        await _emailService.SendPasswordResetAsync(user.Email!, token, cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequestDto request, CancellationToken cancellationToken = default)
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

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequestDto request, CancellationToken cancellationToken = default)
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

    public async Task ConfirmEmailAsync(string userId, string token, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

         string decodedToken;
         try
         {
             decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
         }
         catch (Exception)
         {
             throw new ValidationException("Invalid token format.");
         }

        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
        if (!result.Succeeded)
        {
            throw new ValidationException("Email confirmation failed.");
        }
    }

    public async Task ResendEmailConfirmationAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            // Do not reveal if user exists
            return;
        }

        if (user.EmailConfirmed)
        {
            // Already confirmed
            return;
        }
        
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        
        await _emailService.SendEmailConfirmationAsync(user.Email!, encodedToken, cancellationToken);
    }



    public async Task<UserDto> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        return await MapUserDtoAsync(user);
    }
    
    private async Task<UserDto> MapUserDtoAsync(ApplicationUser user)
    {
        var userDto = _mapper.Map<UserDto>(user);
        var roles = await _userManager.GetRolesAsync(user);
        return userDto with { Roles = roles.ToList() };
    }
}