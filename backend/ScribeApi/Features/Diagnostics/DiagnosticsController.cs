using Microsoft.AspNetCore.Mvc;
using ScribeApi.Infrastructure.Persistence;

namespace ScribeApi.Features.Diagnostics;

[ApiController]
[Route("diag")]
public class DiagnosticsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private const string HeaderName = "X-DIAG-KEY";

    public DiagnosticsController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpGet("deps")]
    public async Task<IActionResult> CheckDependencies(CancellationToken cancellationToken)
    {
        // 1. Security Check
        var expectedKey = _configuration["Diagnostics:ApiKey"];
        
        // If no key is configured, fail safe (reject) or allow? 
        // Best practice: Fail safe. If not configured, this endpoint shouldn't be open.
        if (string.IsNullOrEmpty(expectedKey))
        {
            return StatusCode(500, new { Status = "Configuration Error", Message = "Diagnostics key not configured" });
        }

        if (!Request.Headers.TryGetValue(HeaderName, out var receivedKey) || receivedKey != expectedKey)
        {
            return StatusCode(403, new { Status = "Forbidden", Message = "Invalid diagnostics key" });
        }

        // 2. Dependency Checks
        try
        {
            var dbStart = DateTime.UtcNow;
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            var dbDuration = (DateTime.UtcNow - dbStart).TotalMilliseconds;

            if (!canConnect)
            {
                return StatusCode(503, new 
                { 
                    Status = "Unhealthy", 
                    Database = new { Status = "Unreachable", DurationMs = dbDuration } 
                });
            }

            // You could add other dependency checks here (Redis, Blob Storage, etc.)

            return Ok(new 
            { 
                Status = "Healthy", 
                Database = new { Status = "Connected", DurationMs = dbDuration },
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Status = "Error", Message = ex.Message });
        }
    }
}
