using ScribeApi.Api.Extensions;
using ScribeApi.Core.Interfaces;
using ScribeApi.Infrastructure.BackgroundJobs;
using ScribeApi.Infrastructure.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddApiServices(builder.Configuration);
builder.Services.AddRateLimiting(builder.Configuration);
builder.Services.AddSignalR();
builder.Services.AddScoped<IJobNotificationService, SignalRNotificationService>();

var app = builder.Build();

// Pipeline
app.UseSwaggerIfDevelopment();

app.UseErrorHandling();

app.UseForwardedHeaders();

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("LocalhostPolicy");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard(app.Environment.IsDevelopment());

app.MapControllers();
app.MapHub<TranscriptionHub>("/hubs/transcription");

// Startup sequence with proper async handling
try 
{
    Console.WriteLine("[STARTUP] Applying migrations...");
    await app.ApplyMigrationsAsync();
    
    Console.WriteLine("[STARTUP] Seeding identity roles...");
    await app.SeedIdentityRolesAsync();

    // Configure Hangfire AFTER migrations (uses async with retry)
    await app.UseHangfireConfigAsync();

    // Configure Azurite CORS if in Development
    await app.ConfigureDevelopmentStorageAsync();

    Console.WriteLine("[STARTUP] Starting application...");
    app.Run();
}
catch (Exception ex)
{
    Console.Error.WriteLine($"[FATAL] Application terminated unexpectedly during startup: {ex}");
    throw;
}