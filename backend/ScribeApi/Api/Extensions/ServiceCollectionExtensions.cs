using System.Text;
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
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Features.Transcriptions.Services;
using ScribeApi.Features.Uploads;
using ScribeApi.Features.Uploads.Contracts;
using ScribeApi.Features.Uploads.Services;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Infrastructure.Storage;
using ScribeApi.Infrastructure.BackgroundJobs;
using ScribeApi.Infrastructure.Email;
using ScribeApi.Infrastructure.Transcription;
using FfmpegMediaService = ScribeApi.Infrastructure.MediaProcessing.FfmpegMediaService;

namespace ScribeApi.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Controllers + Filters
        services.AddControllers(options => { options.Filters.Add<TransactionFilter>(); });

        services.AddEndpointsApiExplorer();

        // Swagger
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "ScribeApi", Version = "v1" });

        });

        // DbContext
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Identity
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
            .AddDefaultTokenProviders();

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
        services.AddScoped<IOAuthService, OAuthService>();
        services.AddScoped<IAuthQueries, AuthQueries>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<IUploadService, UploadService>();
        services.AddScoped<IUploadQueries, UploadQueries>();
        services.AddScoped<IMediaService, MediaService>();
        services.AddScoped<IMediaQueries, MediaQueries>();
        services.AddScoped<ITranscriptionJobService, TranscriptionJobService>();
        services.AddScoped<ITranscriptionJobQueries, TranscriptionJobQueries>();
        // Transcription Provider
        services.Configure<OpenAiSettings>(configuration.GetSection("OpenAi"));
        
        services.AddHttpClient<OpenAiTranscriptionProvider>();
        services.AddScoped<ITranscriptionProvider, OpenAiTranscriptionProvider>();
        services.AddScoped<IFfmpegMediaService, FfmpegMediaService>();
        services.AddScoped<TranscriptionJobRunner>();

        // Hangfire
        services.AddHangfireServices(configuration);

        // HttpClient for OAuthService
        services.AddHttpClient<IOAuthService, OAuthService>();
        


        // Options binding (non-secret config)
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
        services.Configure<PlansOptions>(configuration.GetSection("Plans"));
        services.Configure<OAuthSettings>(configuration.GetSection("OAuth"));

        services.AddSingleton<IPlanResolver, PlanResolver>();
        services.AddSingleton<IPlanGuard, PlanGuard>();

        return services;
    }
}