using System.Diagnostics;
using System.Text;

namespace PAS.API.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    // Never log bodies for these paths — they contain passwords or tokens
    private static readonly string[] SensitivePaths =
    [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh-token",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/auth/change-password"
    ];

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next   = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var request   = context.Request;
        var path      = request.Path.Value?.ToLower() ?? string.Empty;
        var isSensitive = SensitivePaths.Any(p =>
            path.StartsWith(p, StringComparison.OrdinalIgnoreCase));

        // Log request — mask body for sensitive endpoints
        if (_logger.IsEnabled(LogLevel.Information))
        {
            if (isSensitive)
            {
                _logger.LogInformation(
                    "HTTP {Method} {Path} started. [body masked]",
                    request.Method,
                    request.Path);
            }
            else
            {
                var requestBody = await ReadRequestBody(request);
                _logger.LogInformation(
                    "HTTP {Method} {Path} started. Body: {RequestBody}",
                    request.Method,
                    request.Path,
                    requestBody);
            }
        }

        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body  = responseBody;

        try
        {
            await _next(context);
            stopwatch.Stop();

            if (_logger.IsEnabled(LogLevel.Information))
            {
                if (isSensitive)
                {
                    _logger.LogInformation(
                        "HTTP {Method} {Path} completed with {StatusCode} in {ElapsedMs}ms. [body masked]",
                        request.Method,
                        request.Path,
                        context.Response.StatusCode,
                        stopwatch.ElapsedMilliseconds);
                }
                else
                {
                    var responseBodyContent = await ReadResponseBody(context.Response);
                    _logger.LogInformation(
                        "HTTP {Method} {Path} completed with {StatusCode} in {ElapsedMs}ms. Response: {ResponseBody}",
                        request.Method,
                        request.Path,
                        context.Response.StatusCode,
                        stopwatch.ElapsedMilliseconds,
                        responseBodyContent);
                }
            }
        }
        finally
        {
            // Reset position back to 0 before copying to prevent empty responses
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
    }

    private static async Task<string> ReadRequestBody(HttpRequest request)
    {
        if (request.ContentLength == null || request.ContentLength == 0)
            return "[empty]";

        request.EnableBuffering();

        // Safe StreamReader implementation avoids CA2022 and infinite/incomplete reading states
        using (var reader = new StreamReader(request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, bufferSize: 1024, leaveOpen: true))
        {
            var bodyAsText = await reader.ReadToEndAsync();
            request.Body.Position = 0; // Reset stream so controller can read it
            return bodyAsText;
        }
    }

    private static async Task<string> ReadResponseBody(HttpResponse response)
    {
        response.Body.Seek(0, SeekOrigin.Begin);
        // Explicitly leave the stream open so the pipeline can copy it safely in the finally block
        using (var reader = new StreamReader(response.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, bufferSize: 1024, leaveOpen: true))
        {
            var text = await reader.ReadToEndAsync();
            response.Body.Seek(0, SeekOrigin.Begin);
            return text;
        }
    }
}