using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ScribeApi.Api.Extensions;
using ScribeApi.Features.Auth.Contracts;
using ScribeApi.Shared.Extensions;

namespace ScribeApi.Features.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [EnableRateLimiting("fixed")]
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.RegisterAsync(request, cancellationToken);
        // We can return CreatedAtAction if we want strictly RESTful, pointing to Me
        return CreatedAtAction(nameof(Me), response);
    }

    [EnableRateLimiting("fixed")]
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.LoginAsync(request, cancellationToken);
        return Ok(response);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await _authService.LogoutAsync(cancellationToken);
        return Ok(new { message = "Logged out successfully." });
    }

    [EnableRateLimiting("fixed")]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequestDto request, CancellationToken cancellationToken)
    {
        await _authService.ForgotPasswordAsync(request, cancellationToken);
        return Ok(new { message = "If the email exists, a password reset link has been sent." });
    }

    [EnableRateLimiting("fixed")]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequestDto request, CancellationToken cancellationToken)
    {
        await _authService.ResetPasswordAsync(request, cancellationToken);
        return Ok(new { message = "Password has been reset successfully." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequestDto request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _authService.ChangePasswordAsync(userId, request, cancellationToken);
        return Ok(new { message = "Password changed successfully." });
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token, CancellationToken cancellationToken)
    {
        await _authService.ConfirmEmailAsync(userId, token, cancellationToken);
        return Ok(new { message = "Email confirmed successfully." });
    }

    [EnableRateLimiting("fixed")]
    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendEmailConfirmation(ResendEmailConfirmationRequestDto request, CancellationToken cancellationToken)
    {
        await _authService.ResendEmailConfirmationAsync(request.Email, cancellationToken);
        return Ok(new { message = "If the email exists and is not confirmed, a new confirmation link has been sent." });
    }

    [HttpPost("external-login")]
    public async Task<ActionResult<UserDto>> ExternalLogin(ExternalAuthRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.ExternalLoginAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("oauth/callback")]
    public async Task<ActionResult<UserDto>> OAuthCallback(OAuthCallbackRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.OAuthCallbackAsync(request, cancellationToken);
        return Ok(response);
    }

    [Authorize]
    [HttpPost("oauth/link")]
    public async Task<IActionResult> LinkOAuthAccount(LinkOAuthAccountRequestDto request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _authService.LinkExternalAccountAsync(userId, request, cancellationToken);
        return Ok(new { message = "External account linked successfully." });
    }

    [Authorize]
    [HttpGet("oauth/linked-accounts")]
    public async Task<ActionResult<List<ExternalLoginDto>>> GetLinkedAccounts(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var accounts = await _authService.GetLinkedAccountsAsync(userId, cancellationToken);
        return Ok(accounts);
    }

    [Authorize]
    [HttpDelete("oauth/unlink/{provider}")]
    public async Task<IActionResult> UnlinkOAuthAccount(string provider, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _authService.UnlinkExternalAccountAsync(userId, provider, cancellationToken);
        return Ok(new { message = $"{provider} account unlinked successfully." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _authService.GetUserByIdAsync(userId, cancellationToken);
        return Ok(user);
    }
}