using Microsoft.AspNetCore.Mvc;
using ScribeApi.Infrastructure.Persistence;

namespace ScribeApi.Features.Health;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;

    public HealthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth(CancellationToken cancellationToken)
    {
        // Simple database connectivity check
        var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
        
        if (!canConnect)
        {
            return StatusCode(503, new { Status = "Unhealthy", Database = "Unreachable" });
        }

        return Ok(new { Status = "Healthy", Database = "Connected", Timestamp = DateTime.UtcNow });
    }
}
