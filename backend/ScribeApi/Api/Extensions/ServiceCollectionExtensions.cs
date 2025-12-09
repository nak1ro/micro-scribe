using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ScribeApi.Api.Filters;
using ScribeApi.Common.Configuration;
using ScribeApi.Common.Configuration.Plans;
using ScribeApi.Common.Interfaces;
using ScribeApi.Features.Auth;
using ScribeApi.Features.Uploads;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Infrastructure.Services;
using ScribeApi.Infrastructure.Storage;

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
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description =
                    "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        // DbContext
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

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

        // JWT settings
        var jwtSection = configuration.GetSection("JwtSettings");
        services.Configure<JwtSettings>(jwtSection);

        var jwtSettings = jwtSection.Get<JwtSettings>()
                          ?? throw new InvalidOperationException("JwtSettings section is missing or invalid.");

        var key = Encoding.UTF8.GetBytes(jwtSettings.Secret);

        // Authentication
        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero
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
        
        // HttpClient for OAuthService
        services.AddHttpClient<IOAuthService, OAuthService>();
        
        // Register JwtSettings as singleton for direct injection
        services.AddSingleton(jwtSettings);

        // Options binding (non-secret config)
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
        services.Configure<PlansOptions>(configuration.GetSection("Plans"));
        services.Configure<OAuthSettings>(configuration.GetSection("OAuth"));

        return services;
    }
}