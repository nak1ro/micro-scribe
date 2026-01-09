using Hangfire;
using Hangfire.PostgreSql;
using ScribeApi.Infrastructure.BackgroundJobs;

namespace ScribeApi.Infrastructure.BackgroundJobs;

public static class HangfireSetup
{
    public static IServiceCollection AddHangfireServices(
        this IServiceCollection services, 
        Npgsql.NpgsqlDataSource dataSource)
    {
        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(options => 
                options.UseConnectionFactory(new NpgsqlDataSourceConnectionFactory(dataSource))));

        services.AddHangfireServer(options =>
        {
            options.Queues = new[] { "priority", "default" };
            options.WorkerCount = Environment.ProcessorCount * 2;
        });

        // Register job
        // Note: For recurring jobs, it's often better to do this in the app startup (Configure) 
        // but we can't easily inject IRecurringJobManager here in AddHangfireServices.
        // We will do it in Program.cs or a separate helper if possible.
        // Actually, let's keep this method focused on Service registration.
        
        return services;
    }

    public static IApplicationBuilder UseHangfireConfig(
        this IApplicationBuilder app)
    {
        var manager = app.ApplicationServices.GetRequiredService<IRecurringJobManager>();
        
        manager.AddOrUpdate<CleanupStaleUploadsJob>(
            "cleanup-stale-uploads",
            job => job.RunAsync(CancellationToken.None),
            Cron.Hourly);

        manager.AddOrUpdate<CleanupProcessedEventsJob>(
            "cleanup-processed-stripe-events",
            job => job.RunAsync(CancellationToken.None),
            Cron.Daily);

        return app;
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



    private class NpgsqlDataSourceConnectionFactory : Hangfire.PostgreSql.IConnectionFactory
    {
        private readonly Npgsql.NpgsqlDataSource _dataSource;
        public NpgsqlDataSourceConnectionFactory(Npgsql.NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public Npgsql.NpgsqlConnection GetOrCreateConnection()
        {
            return _dataSource.CreateConnection();
        }
    }
}