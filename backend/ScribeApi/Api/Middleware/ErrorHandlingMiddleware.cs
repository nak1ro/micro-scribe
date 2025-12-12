using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ScribeApi.Core.Exceptions;

namespace ScribeApi.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
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
        _logger.LogError(exception, "Unhandled exception caught by ExceptionHandlingMiddleware");

        if (context.Response.HasStarted)
        {
            // We can't modify the response at this point, so rethrow
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
            Detail = _env.IsDevelopment()
                ? exception.ToString() // full details in dev (stack trace etc.)
                : exception.Message, // safer message in production
            Instance = context.TraceIdentifier,
            Type = "https://httpstatuses.com/" + (int)statusCode
        };

        // Optional: include exception type in dev for easier debugging
        if (_env.IsDevelopment())
        {
            problemDetails.Extensions["exceptionType"] = exception.GetType().FullName;
        }

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var payload = JsonSerializer.Serialize(problemDetails, options);
        await context.Response.WriteAsync(payload);
    }

    private static (HttpStatusCode statusCode, string title) MapExceptionToStatusCode(Exception exception)
    {
        return exception switch
        {
            AuthenticationException => (HttpStatusCode.Unauthorized, "Authentication failed"),
            UnauthorizedException => (HttpStatusCode.Forbidden, "Forbidden"),
            NotFoundException => (HttpStatusCode.NotFound, "Resource not found"),
            ConflictException => (HttpStatusCode.Conflict, "Conflict"),
            ValidationException => (HttpStatusCode.BadRequest, "Validation failed"),
            OAuthException => (HttpStatusCode.BadGateway, "External authentication error"),
            AccountLinkingException => (HttpStatusCode.Conflict, "Account linking conflict"),
            PlanLimitExceededException => (HttpStatusCode.PaymentRequired, "Plan limit exceeded"),
            TranscriptionException => (HttpStatusCode.UnprocessableEntity, "Transcription processing error"),
            StorageException => (HttpStatusCode.ServiceUnavailable, "Storage service error"),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };
    }
}