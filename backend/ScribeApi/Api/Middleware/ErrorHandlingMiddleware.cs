using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace ScribeApi.Api.Middleware;

public sealed class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ErrorHandlingMiddleware(
        RequestDelegate next,
        ILogger<ErrorHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Log first
        _logger.LogError(exception, "Unhandled exception caught by ErrorHandlingMiddleware");

        if (context.Response.HasStarted)
        {
            throw exception;
        }

        context.Response.Clear();
        context.Response.ContentType = "application/json";

        var (statusCode, title) = MapExceptionToStatusCode(exception);

        context.Response.StatusCode = (int)statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Detail = _env.IsDevelopment() ? exception.ToString() : null,
            Instance = context.TraceIdentifier,
            Type = "https://httpstatuses.com/" + (int)statusCode
        };

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var payload = JsonSerializer.Serialize(problemDetails, options);
        await context.Response.WriteAsync(payload);
    }

    private static (HttpStatusCode statusCode, string title) MapExceptionToStatusCode(Exception ex)
    {
        // Customize this mapping as needed for your app-specific exceptions
        return ex switch
        {
            // Example custom exceptions:
            // ValidationException => (HttpStatusCode.BadRequest, "Validation failed"),
            // NotFoundException => (HttpStatusCode.NotFound, "Resource not found"),

            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };
    }
}