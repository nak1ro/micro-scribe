using Microsoft.AspNetCore.Identity;

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
            var logger = services.GetRequiredService<ILogger<WebApplication>>();
            logger.LogError(ex, "An error occurred while seeding Identity roles.");
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