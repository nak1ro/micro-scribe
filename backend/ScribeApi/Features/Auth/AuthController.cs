using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScribeApi.Features.Auth.Contracts;

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

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.RegisterAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Me), response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.LoginAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh(RefreshTokenRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.RefreshTokenAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequestDto request, CancellationToken cancellationToken)
    {
        await _authService.ForgotPasswordAsync(request, cancellationToken);
        return Ok(new { message = "If the email exists, a password reset link has been sent." });
    }

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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        await _authService.ChangePasswordAsync(userId, request, cancellationToken);
        return Ok(new { message = "Password changed successfully." });
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token, CancellationToken cancellationToken)
    {
        await _authService.ConfirmEmailAsync(userId, token, cancellationToken);
        return Ok(new { message = "Email confirmed successfully." });
    }

    [Authorize]
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        await _authService.RevokeTokenAsync(userId, cancellationToken);
        return Ok(new { message = "Tokens revoked successfully." });
    }

    [HttpPost("external-login")]
    public async Task<ActionResult<AuthResponseDto>> ExternalLogin(ExternalAuthRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.ExternalLoginAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("oauth/callback")]
    public async Task<ActionResult<AuthResponseDto>> OAuthCallback(OAuthCallbackRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.OAuthCallbackAsync(request, cancellationToken);
        return Ok(response);
    }

    [Authorize]
    [HttpPost("oauth/link")]
    public async Task<IActionResult> LinkOAuthAccount(LinkOAuthAccountRequestDto request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        await _authService.LinkExternalAccountAsync(userId, request, cancellationToken);
        return Ok(new { message = "External account linked successfully." });
    }

    [Authorize]
    [HttpGet("oauth/linked-accounts")]
    public async Task<ActionResult<List<ExternalLoginDto>>> GetLinkedAccounts(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var accounts = await _authService.GetLinkedAccountsAsync(userId, cancellationToken);
        return Ok(accounts);
    }

    [Authorize]
    [HttpDelete("oauth/unlink/{provider}")]
    public async Task<IActionResult> UnlinkOAuthAccount(string provider, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        await _authService.UnlinkExternalAccountAsync(userId, provider, cancellationToken);
        return Ok(new { message = $"{provider} account unlinked successfully." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await _authService.GetUserByIdAsync(userId, cancellationToken);
        return Ok(user);
    }
}