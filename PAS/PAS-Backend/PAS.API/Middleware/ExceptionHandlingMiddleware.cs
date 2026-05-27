using Application.Common.Exceptions;
using Newtonsoft.Json;
using PAS.API.Models.Responses;

namespace PAS.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
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

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Full detail goes to logs only — never to client
        _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

        context.Response.ContentType = "application/json";

        var (statusCode, safeMessage) = exception switch
        {
            NotFoundException              => (StatusCodes.Status404NotFound,
                                              exception.Message),
            ValidationException            => (StatusCodes.Status400BadRequest,
                                              exception.Message),
            UnauthorizedAccessException    => (StatusCodes.Status401Unauthorized,
                                              "Unauthorized."),
            ForbiddenAccessException       => (StatusCodes.Status403Forbidden,
                                              "Access denied."),
            BusinessRuleException          => (StatusCodes.Status422UnprocessableEntity,
                                              exception.Message),
            _                              => (StatusCodes.Status500InternalServerError,
                                              "An unexpected error occurred. Please try again later.")
        };

        var response = new ErrorResponse
        {
            StatusCode = statusCode,
            Message    = safeMessage,
            Timestamp  = DateTime.UtcNow
            // ❌ Errors and StackTrace fields intentionally omitted — never expose internals
        };

        context.Response.StatusCode = statusCode;
        return context.Response.WriteAsync(JsonConvert.SerializeObject(response));
    }
}