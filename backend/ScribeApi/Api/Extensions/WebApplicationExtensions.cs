using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Infrastructure.Persistence;

namespace ScribeApi.Api.Extensions;

public static class WebApplicationExtensions
{
    public static async Task SeedIdentityRolesAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;

        try
        {
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            if (!await roleManager.RoleExistsAsync("User"))
            {
                await roleManager.CreateAsync(new IdentityRole("User"));
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[CRITICAL] Error seeding Identity roles: {ex}");
            var logger = services.GetRequiredService<ILogger<WebApplication>>();
            logger.LogError(ex, "An error occurred while seeding Identity roles.");
        }
    }

    public static async Task ApplyMigrationsAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;

        try
        {
            var context = services.GetRequiredService<AppDbContext>();
            await context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[CRITICAL] Error applying migrations: {ex}");
            var logger = services.GetRequiredService<ILogger<WebApplication>>();
            logger.LogError(ex, "An error occurred while applying database migrations.");
            throw; // Fail startup if migrations fail
        }
    }

    public static void UseSwaggerIfDevelopment(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
    }
}