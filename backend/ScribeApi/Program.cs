using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ScribeApi.Api.Extensions;
using ScribeApi.Api.Filters;
using ScribeApi.Api.Middleware;
using ScribeApi.Common.Configuration;
using ScribeApi.Common.Interfaces;
using ScribeApi.Features.Auth;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;
using ScribeApi.Infrastructure.Services;

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

app.MapControllers();

// Seeding
await app.SeedIdentityRolesAsync();

app.Run();