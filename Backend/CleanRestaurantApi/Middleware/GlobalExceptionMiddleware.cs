using CleanRestaurantApi.Errors;
using Serilog;
using System.Text.Json;

namespace CleanRestaurantApi.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IHostEnvironment _env;

        public GlobalExceptionMiddleware(RequestDelegate next, IHostEnvironment env)
        {
            _next = next;
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
                if (ex is AppException appEx)
                    Log.Warning(ex, "Handled domain exception {Code} ({Status}) TraceId={TraceId}", appEx.Code, (int)appEx.StatusCode, context.TraceIdentifier);
                else
                    Log.Error(ex, "Unhandled exception TraceId={TraceId}", context.TraceIdentifier);

                await WriteProblemDetailsAsync(context, ex);
            }
        }

        private async Task WriteProblemDetailsAsync(HttpContext context, Exception ex)
        {
            var includeExceptionDetails = _env.IsDevelopment();
            var problem = ProblemDetailsFactoryEx.BuildFromException(context, ex, includeExceptionDetails);

            context.Response.ContentType = "application/problem+json";
            context.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;

            var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = includeExceptionDetails
            });

            await context.Response.WriteAsync(json);
        }
    }
}
