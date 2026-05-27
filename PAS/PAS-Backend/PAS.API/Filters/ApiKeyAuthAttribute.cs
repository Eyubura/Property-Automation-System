using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PAS.API.Models.Responses;

namespace PAS.API.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ApiKeyAuthAttribute : Attribute, IAsyncAuthorizationFilter
{
    private const string ApiKeyHeaderName = "X-API-Key";

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        // Read from configuration — never hardcode
        var configuration = context.HttpContext.RequestServices
            .GetRequiredService<IConfiguration>();

        var validKey = configuration["ApiKey"];

        if (string.IsNullOrWhiteSpace(validKey))
        {
            context.Result = new ObjectResult(new ErrorResponse
            {
                StatusCode = StatusCodes.Status500InternalServerError,
                Message    = "API key is not configured on the server.",
                Timestamp  = DateTime.UtcNow
            })
            { StatusCode = StatusCodes.Status500InternalServerError };
            return;
        }

        if (!context.HttpContext.Request.Headers
            .TryGetValue(ApiKeyHeaderName, out var extractedApiKey))
        {
            context.Result = new UnauthorizedObjectResult(new ErrorResponse
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Message    = "API Key is missing.",
                Timestamp  = DateTime.UtcNow
            });
            return;
        }

        if (!validKey.Equals(extractedApiKey.ToString(),
            StringComparison.Ordinal))
        {
            context.Result = new UnauthorizedObjectResult(new ErrorResponse
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Message    = "Invalid API Key.",
                Timestamp  = DateTime.UtcNow
            });
            return;
        }

        await Task.CompletedTask;
    }
}