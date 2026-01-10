using Hangfire;
using Hangfire.PostgreSql;

namespace ScribeApi.Infrastructure.BackgroundJobs;

public static class HangfireSetup
{
    public static IServiceCollection AddHangfireServices(
        this IServiceCollection services, 
        Npgsql.NpgsqlDataSource dataSource)
    {
        // Store datasource for deferred initialization
        services.AddSingleton(new HangfireDataSourceHolder(dataSource));
        
        services.AddHangfire((sp, config) =>
        {
            var holder = sp.GetRequiredService<HangfireDataSourceHolder>();
            
            config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(options => 
                    options.UseConnectionFactory(new NpgsqlDataSourceConnectionFactory(holder.DataSource)),
                    new PostgreSqlStorageOptions
                    {
                        // Defer schema prep to avoid blocking startup
                        PrepareSchemaIfNecessary = true,
                        // Use shorter timeouts for initial connection attempts
                        DistributedLockTimeout = TimeSpan.FromMinutes(1),
                        TransactionSynchronisationTimeout = TimeSpan.FromMinutes(1),
                        // Reduced polling for Azure environment
                        QueuePollInterval = TimeSpan.FromSeconds(15)
                    });
        });

        services.AddHangfireServer(options =>
        {
            options.Queues = new[] { "priority", "default" };
            options.WorkerCount = Environment.ProcessorCount * 2;
        });
        
        return services;
    }

    public static async Task<IApplicationBuilder> UseHangfireConfigAsync(
        this IApplicationBuilder app,
        CancellationToken cancellationToken = default)
    {
        // Retry logic for Hangfire job registration (DB may still be warming up)
        const int maxRetries = 3;
        const int retryDelayMs = 5000;
        
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                Console.WriteLine($"[STARTUP] Configuring Hangfire recurring jobs (attempt {attempt}/{maxRetries})...");
                
                var manager = app.ApplicationServices.GetRequiredService<IRecurringJobManager>();
                
                manager.AddOrUpdate<CleanupStaleUploadsJob>(
                    "cleanup-stale-uploads",
                    job => job.RunAsync(CancellationToken.None),
                    Cron.Hourly);

                manager.AddOrUpdate<CleanupProcessedEventsJob>(
                    "cleanup-processed-stripe-events",
                    job => job.RunAsync(CancellationToken.None),
                    Cron.Daily);

                Console.WriteLine("[STARTUP] Hangfire recurring jobs configured successfully.");
                return app;
            }
            catch (Exception ex) when (attempt < maxRetries)
            {
                Console.WriteLine($"[STARTUP] Hangfire config attempt {attempt} failed: {ex.Message}. Retrying in {retryDelayMs}ms...");
                await Task.Delay(retryDelayMs, cancellationToken);
            }
        }
        
        // Last attempt - let it throw if it fails
        var managerFinal = app.ApplicationServices.GetRequiredService<IRecurringJobManager>();
        managerFinal.AddOrUpdate<CleanupStaleUploadsJob>(
            "cleanup-stale-uploads",
            job => job.RunAsync(CancellationToken.None),
            Cron.Hourly);
        managerFinal.AddOrUpdate<CleanupProcessedEventsJob>(
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

    // Holder class to defer DataSource resolution
    private class HangfireDataSourceHolder
    {
        public Npgsql.NpgsqlDataSource DataSource { get; }
        public HangfireDataSourceHolder(Npgsql.NpgsqlDataSource dataSource) => DataSource = dataSource;
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