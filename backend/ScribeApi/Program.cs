using ScribeApi.Api.Extensions;
using ScribeApi.Infrastructure.BackgroundJobs;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddApiServices(builder.Configuration);
builder.Services.AddRateLimiting(builder.Configuration);

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

// Seeding
await app.SeedIdentityRolesAsync();

app.Run();