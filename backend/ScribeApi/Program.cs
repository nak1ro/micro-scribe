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
app.UseHangfireConfig();

app.MapControllers();
app.MapHub<TranscriptionHub>("/hubs/transcription");

// Seeding
await app.ApplyMigrationsAsync();
await app.SeedIdentityRolesAsync();

app.Run();