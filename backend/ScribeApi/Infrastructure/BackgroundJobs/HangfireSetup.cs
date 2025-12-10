using Hangfire;
using Hangfire.PostgreSql;

namespace ScribeApi.Infrastructure.BackgroundJobs;

public static class HangfireSetup
{
    public static IServiceCollection AddHangfireServices(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(options => 
                options.UseNpgsqlConnection(connectionString)));

        services.AddHangfireServer(options =>
        {
            options.Queues = new[] { "priority", "default" };
            options.WorkerCount = Environment.ProcessorCount * 2;
        });

        return services;
    }

    public static IApplicationBuilder UseHangfireDashboard(
        this IApplicationBuilder app,
        bool isDevelopment)
    {
        if (isDevelopment)
        {
            app.UseHangfireDashboard("/hangfire");
        }

        return app;
    }
}