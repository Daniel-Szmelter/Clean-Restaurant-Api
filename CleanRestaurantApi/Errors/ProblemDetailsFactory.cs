using Microsoft.AspNetCore.Mvc;

namespace CleanRestaurantApi.Errors
{
    public static class ProblemDetailsFactoryEx
    {
        public static ProblemDetails BuildProblemDetails(
            HttpContext httpContext,
            int statusCode,
            string title,
            string detail,
            ErrorCode code,
            IDictionary<string, string[]>? errors = null)
        {
            var problem = new ProblemDetails
            {
                Type = $"https://httpstatuses.io/{statusCode}",
                Title = title,
                Detail = detail,
                Status = statusCode,
                Instance = httpContext.Request.Path
            };

            // standardowe rozszerzenia
            problem.Extensions["traceId"] = httpContext.TraceIdentifier;
            problem.Extensions["code"] = code.ToString();

            if (errors is not null && errors.Count > 0)
                problem.Extensions["errors"] = errors;

            return problem;
        }

        public static ProblemDetails BuildFromException(
            HttpContext ctx,
            Exception ex,
            bool includeExceptionDetails)
        {
            // AppException – zdefiniowane mapowanie
            if (ex is AppException appEx)
            {
                return BuildProblemDetails(
                    ctx,
                    (int)appEx.StatusCode,
                    title: appEx.GetType().Name,
                    detail: appEx.Message,
                    code: appEx.Code,
                    errors: appEx.Errors
                );
            }

            // FluentValidation (jeśli ktoś rzuca FluentValidation.ValidationException)
            if (ex.GetType().FullName == "FluentValidation.ValidationException")
            {
                var errors = new Dictionary<string, string[]>();
                // Reflection-safe: spróbuj wyciągnąć Errors (IEnumerable<ValidationFailure>)
                var errorsProp = ex.GetType().GetProperty("Errors");
                var enumerable = errorsProp?.GetValue(ex) as System.Collections.IEnumerable;
                if (enumerable is not null)
                {
                    foreach (var failure in enumerable)
                    {
                        var prop = failure.GetType().GetProperty("PropertyName")?.GetValue(failure)?.ToString() ?? "General";
                        var msg = failure.GetType().GetProperty("ErrorMessage")?.GetValue(failure)?.ToString() ?? "Invalid";
                        if (errors.TryGetValue(prop, out var list))
                            errors[prop] = list.Concat(new[] { msg }).ToArray();
                        else
                            errors[prop] = new[] { msg };
                    }
                }

                return BuildProblemDetails(
                    ctx,
                    statusCode: StatusCodes.Status422UnprocessableEntity,
                    title: "ValidationException",
                    detail: "Validation failed.",
                    code: ErrorCode.ValidationFailed,
                    errors: errors
                );
            }

            // Nieznany wyjątek
            var detail = includeExceptionDetails ? ex.ToString() : "An unexpected error occurred.";
            return BuildProblemDetails(
                ctx,
                statusCode: StatusCodes.Status500InternalServerError,
                title: "InternalServerError",
                detail: detail,
                code: ErrorCode.Unknown
            );
        }
    }
}
