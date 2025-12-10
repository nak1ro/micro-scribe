using ScribeApi.Api.Extensions;
using ScribeApi.Infrastructure.BackgroundJobs;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

// Pipeline
app.UseSwaggerIfDevelopment();

app.UseErrorHandling();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard(app.Environment.IsDevelopment());

app.MapControllers();

// Seeding
await app.SeedIdentityRolesAsync();

app.Run();