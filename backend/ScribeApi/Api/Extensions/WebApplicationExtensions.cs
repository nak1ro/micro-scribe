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

    public static async Task ConfigureDevelopmentStorageAsync(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment()) return;

        // We can get BlobServiceClient directly if it's registered (it's Singleton, but resolving from scope is fine)
        // Using scope to prevent potential capturing issues if implementation changes
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        
        try 
        {
            // Only proceed if BlobServiceClient is registered
            var blobServiceClient = services.GetService<Azure.Storage.Blobs.BlobServiceClient>();
            if (blobServiceClient == null) return;
            
            // Check if it's actually Azurite/Local by checking the Uri
            // Azurite default ports: 10000 (Blob), 10001 (Queue), 10002 (Table)
            if (!blobServiceClient.Uri.ToString().Contains("127.0.0.1") && 
                !blobServiceClient.Uri.ToString().Contains("localhost"))
            {
                 return;
            }

            Console.WriteLine("[STARTUP] Configuring Development Storage (Azurite) CORS...");
            
            var properties = await blobServiceClient.GetPropertiesAsync();
            
            // Clear and add generic permissive rule for development
            properties.Value.Cors.Clear();
            properties.Value.Cors.Add(new Azure.Storage.Blobs.Models.BlobCorsRule
            {
                AllowedHeaders = "*",
                AllowedMethods = "GET,PUT,HEAD,POST,DELETE,OPTIONS",
                AllowedOrigins = "*",
                ExposedHeaders = "*",
                MaxAgeInSeconds = 3600
            });

            await blobServiceClient.SetPropertiesAsync(properties.Value);
            Console.WriteLine("[STARTUP] Development Storage CORS configured successfully.");
        }
        catch (Exception ex)
        {
            // Don't crash startup if Azurite isn't ready, just warn
            Console.WriteLine($"[WARNING] Could not configure Development Storage CORS: {ex.Message}");
        }
    }
}