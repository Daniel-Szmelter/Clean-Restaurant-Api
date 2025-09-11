using System.Diagnostics;

namespace CleanRestaurantApi.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var sw = Stopwatch.StartNew();
            var request = context.Request;

            _logger.LogInformation("Incoming Request: {method} {url} from {ip}",
                request.Method, request.Path, context.Connection.RemoteIpAddress);

            await _next(context);

            sw.Stop();
            _logger.LogInformation("Response: {statusCode} ({elapsed}ms)",
                context.Response.StatusCode, sw.ElapsedMilliseconds);
        }
    }
}
