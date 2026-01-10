using System.Text;
using Npgsql;
using System.Text.Json.Serialization;
using Azure.Identity;
using Azure.Storage.Blobs;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ScribeApi.Api.Filters;
using ScribeApi.Core.Configuration;
using ScribeApi.Core.Domain.Plans;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Auth;
using ScribeApi.Features.Auth.Contracts;
using ScribeApi.Features.Auth.Services;
using ScribeApi.Features.Media;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Features.Media.Services;
using ScribeApi.Features.Uploads;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Transcriptions.Jobs;
using ScribeApi.Features.Transcriptions.Export;
using ScribeApi.Features.Transcriptions.Editor;
using ScribeApi.Features.Analysis.Contracts;
using ScribeApi.Features.Analysis.Services;
using ScribeApi.Features.Translation.Contracts;
using ScribeApi.Features.Translation.Services;
using ScribeApi.Features.Uploads.Contracts;
using ScribeApi.Features.Uploads.Services;
using ScribeApi.Features.Webhooks.Contracts;
using ScribeApi.Features.Webhooks.Services;
using ScribeApi.Features.Usage.Services;
using ScribeApi.Features.Usage.Contracts;
using ScribeApi.Features.Folders.Contracts;
using ScribeApi.Features.Folders.Services;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Infrastructure.Storage;
using ScribeApi.Infrastructure.BackgroundJobs;
using ScribeApi.Infrastructure.Email;
using ScribeApi.Infrastructure.Transcription;
using FfmpegMediaService = ScribeApi.Infrastructure.MediaProcessing.FfmpegMediaService;
using ScribeApi.Infrastructure.AI;
using ScribeApi.Infrastructure.External.Google;
using ScribeApi.Features.Transcriptions.Import;

namespace ScribeApi.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Controllers + Filters
        services.AddControllers(options => { options.Filters.Add<TransactionFilter>(); })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        services.AddEndpointsApiExplorer();

        // Swagger
        services.AddSwaggerGen(c => { c.SwaggerDoc("v1", new OpenApiInfo { Title = "ScribeApi", Version = "v1" }); });

        services.Configure<CorsSettings>(configuration.GetSection(CorsSettings.SectionName));
        var corsSettings = configuration.GetSection(CorsSettings.SectionName).Get<CorsSettings>();
        var allowedOrigins = corsSettings?.AllowedOrigins ?? Array.Empty<string>();

        services.AddCors(options =>
        {
            options.AddPolicy("LocalhostPolicy", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("VerifiedUser", policy =>
                policy.RequireClaim("email_verified", "true"));
        });


        // DbContext
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            Console.Error.WriteLine("[FATAL] 'DefaultConnection' connection string is MISSING or EMPTY.");
        }
        else
        {
            Console.WriteLine($"[STARTUP] Found 'DefaultConnection' (Length: {connectionString.Length}). Host: {GetHostFromConnString(connectionString)}");
        }

        var builder = new NpgsqlConnectionStringBuilder(connectionString)
        {
            CommandTimeout = 60, // Increase timeout for Burstable instances
            Pooling = true,
            MinPoolSize = 0,
            MaxPoolSize = 50 // Limit pool size to prevent exhaustion
        };
        
        var dataSourceBuilder = new NpgsqlDataSourceBuilder(builder.ToString());
        dataSourceBuilder.EnableDynamicJson();
        var dataSource = dataSourceBuilder.Build();

        services.AddSingleton(dataSource);

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(dataSource));

        // Identity
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequiredLength = 8;
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders()
            .AddClaimsPrincipalFactory<CustomUserClaimsPrincipalFactory>();

        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.ExpireTimeSpan = TimeSpan.FromDays(30);
            options.SlidingExpiration = true;

            options.Events.OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };

            options.Events.OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });

        // FluentValidation
        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

        // AutoMapper
        services.AddAutoMapper(typeof(AuthMappingProfile));

        // Custom services
        services.AddScoped<TransactionFilter>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IExternalAuthService, ExternalAuthService>();
        services.AddScoped<IOAuthService, OAuthService>();
        services.AddScoped<IAuthQueries, AuthQueries>();
        services.AddScoped<CustomUserClaimsPrincipalFactory>();
        services.AddScoped<IMediaService, MediaService>();
        services.AddScoped<IMediaQueries, MediaQueries>();
        
        // Transcription services (new sub-folder namespaces)
        services.AddScoped<ITranscriptionJobService, TranscriptionJobService>();
        services.AddScoped<ITranscriptionJobQueries, TranscriptionJobQueries>();
        services.AddScoped<ITranscriptExportService, TranscriptExportService>();
        services.AddScoped<ITranscriptEditService, TranscriptEditService>();
        
        // Analysis feature (new top-level feature)
        services.AddScoped<IAnalysisService, AnalysisService>();
        
        // Translation feature (new top-level feature)
        services.AddScoped<IJobTranslationService, JobTranslationService>();
        
        services.AddScoped<IUploadService, UploadService>();
        services.AddScoped<IWebhookService, WebhookService>();
        services.AddScoped<IUsageService, UsageService>();
        services.AddScoped<IFolderService, FolderService>();
        services.AddScoped<WebhookDeliveryJob>();
        services.AddHttpClient<WebhookDeliveryJob>();
        services.Configure<OpenAiSettings>(configuration.GetSection("OpenAi"));
        services.AddHttpClient<IGenerativeAiService, OpenAiGenerativeAiService>();

        services.Configure<WhisperXSettings>(configuration.GetSection("WhisperX"));

        // Transcription provider - configurable via Transcription:Provider (OpenAi or WhisperX)
        var transcriptionProvider = configuration["Transcription:Provider"] ?? "OpenAi";
        Console.WriteLine($"[STARTUP] Transcription Provider configured: '{transcriptionProvider}'");
        
        if (transcriptionProvider.Equals("WhisperX", StringComparison.OrdinalIgnoreCase))
        {
            Console.WriteLine("[STARTUP] Registering WhisperXTranscriptionProvider");
            services.AddHttpClient<ITranscriptionProvider, WhisperXTranscriptionProvider>();
        }
        else
        {
            Console.WriteLine("[STARTUP] Registering OpenAiTranscriptionProvider");
            services.AddHttpClient<ITranscriptionProvider, OpenAiTranscriptionProvider>();
        }

        services.AddScoped<IFfmpegMediaService, FfmpegMediaService>();
        services.AddScoped<ChunkedTranscriptionService>();
        services.AddScoped<TranscriptionJobRunner>();
        services.AddScoped<FileValidationJob>();
        services.AddScoped<IUploadService, UploadService>();
        
        // Transcription settings
        services.Configure<TranscriptionSettings>(configuration.GetSection("Transcription"));

        // Translation services
        services.Configure<TranslationSettings>(configuration.GetSection("Translation"));
        services.AddHttpClient<ITranslationService, Infrastructure.Translation.AzureTranslationService>();

        // Hangfire
        services.AddHangfireServices(dataSource);

        // HttpClient for OAuthService
        services.AddHttpClient<IOAuthService, OAuthService>();

        // Storage - Azure Blob is primary, Local for development
        var storageProvider = configuration["Storage:Provider"] ?? "Azure";

        if (storageProvider.Equals("Azure", StringComparison.OrdinalIgnoreCase))
        {
            var blobSettings = configuration.GetSection("Storage:AzureBlob").Get<AzureBlobSettings>();
            services.Configure<AzureBlobSettings>(configuration.GetSection("Storage:AzureBlob"));
            
            services.AddSingleton(x => {
                if (!string.IsNullOrEmpty(blobSettings?.ServiceUrl))
                {
                    // Managed Identity
                    return new BlobServiceClient(new Uri(blobSettings.ServiceUrl), new DefaultAzureCredential());
                }
                
                // Connection String fallback
                return new BlobServiceClient(blobSettings?.ConnectionString);
            });
            
            services.AddScoped<IFileStorageService, AzureBlobStorageService>();
        }
        else
        {
            services.AddScoped<IFileStorageService, LocalFileStorageService>();
        }
        
        // Options binding (non-secret config)
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
        services.Configure<PlansOptions>(configuration.GetSection("Plans"));
        services.Configure<OAuthSettings>(configuration.GetSection("OAuth"));
        services.Configure<StorageSettings>(configuration.GetSection("Storage"));
        services.Configure<YouTubeSettings>(configuration.GetSection(YouTubeSettings.SectionName));

        services.AddSingleton<IPlanResolver, PlanResolver>();
        services.AddSingleton<IPlanGuard, PlanGuard>();

        // YouTube Integration
        services.AddScoped<IYouTubeService, YouTubeService>();
        services.AddScoped<IYouTubeImportService, YouTubeImportService>();

        // Billing
        services.AddBilling(configuration);

        return services;
    }
}