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

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("LocalhostPolicy");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard(app.Environment.IsDevelopment());
try
{
    Console.WriteLine("[STARTUP] Configuring Hangfire jobs...");
    app.UseHangfireConfig();
}
catch (Exception ex)
{
    Console.Error.WriteLine($"[FATAL] Error configuring Hangfire (DB Connection likely failed): {ex.Message}");
    // We don't throw here immediately if we want to try to reach the other main try-catch, 
    // but since this is critical, we probably should or just let it log and cascade.
    // Given the previous crash, let's log explicitly.
    throw;
}

app.MapControllers();
app.MapHub<TranscriptionHub>("/hubs/transcription");

// Seeding
try 
{
    Console.WriteLine("[STARTUP] Applying migrations...");
    await app.ApplyMigrationsAsync();
    
    Console.WriteLine("[STARTUP] Seeding identity roles...");
    await app.SeedIdentityRolesAsync();

    Console.WriteLine("[STARTUP] Starting application...");
    app.Run();
}
catch (Exception ex)
{
    Console.Error.WriteLine($"[FATAL] Application terminated unexpectedly during startup: {ex}");
    throw;
}