using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScribeApi.Features.Usage.Contracts;
using ScribeApi.Shared.Extensions;

namespace ScribeApi.Features.Usage;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsageController : ControllerBase
{
    private readonly IUsageService _service;

    public UsageController(IUsageService service)
    {
        _service = service;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UsageResponse>> GetUsage(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _service.GetUsageAsync(userId, ct);
        if (result == null) return NotFound();

        return Ok(result);
    }
}