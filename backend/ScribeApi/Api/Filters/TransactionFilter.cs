using Microsoft.AspNetCore.Mvc.Filters;
using ScribeApi.Infrastructure.Persistence;

namespace ScribeApi.Api.Filters;

public class TransactionFilter : IAsyncActionFilter
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<TransactionFilter> _logger;

    public TransactionFilter(AppDbContext dbContext, ILogger<TransactionFilter> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var method = context.HttpContext.Request.Method;

        // Skip for read-only methods
        if (HttpMethods.IsGet(method) ||
            HttpMethods.IsHead(method) ||
            HttpMethods.IsOptions(method) ||
            HttpMethods.IsTrace(method))
        {
            await next();
            return;
        }
        
        // Skip if action/controller is marked with SkipTransactionAttribute
        var actionDescriptor = context.ActionDescriptor as Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor;
        if (actionDescriptor != null)
        {
            var hasSkipAttribute = actionDescriptor.MethodInfo.GetCustomAttributes(typeof(SkipTransactionAttribute), true).Any() ||
                                   actionDescriptor.ControllerTypeInfo.GetCustomAttributes(typeof(SkipTransactionAttribute), true).Any();
            if (hasSkipAttribute)
            {
                await next();
                return;
            }
        }

        // For write operations (POST, PUT, PATCH, DELETE)
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var resultContext = await next();

            if (resultContext.Exception == null && resultContext.HttpContext.Response.StatusCode < 400)
            {
                _logger.LogDebug("Transaction committed for {Method} {Path}",
                    method, context.HttpContext.Request.Path);
                await transaction.CommitAsync();
            }
            else
            {
                // Rollback is automatic on dispose if not committed, but we can log here
                _logger.LogInformation("Transaction rolled back due to error or failure status code.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during transaction execution. Rolling back.");
            throw;
        }
    }
}