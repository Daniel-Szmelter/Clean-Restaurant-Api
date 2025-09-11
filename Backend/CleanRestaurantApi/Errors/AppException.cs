using System.Net;

namespace CleanRestaurantApi.Errors
{
    public abstract class AppException : Exception
    {
        protected AppException(string message, ErrorCode code, HttpStatusCode statusCode, Exception? inner = null)
            : base(message, inner)
        {
            Code = code;
            StatusCode = statusCode;
        }

        public ErrorCode Code { get; }
        public HttpStatusCode StatusCode { get; }
        public virtual IDictionary<string, string[]>? Errors => null;
    }

    public sealed class NotFoundException : AppException
    {
        public NotFoundException(string resource, object key)
            : base($"{resource} with key '{key}' was not found.", ErrorCode.NotFound, HttpStatusCode.NotFound) { }
    }

    public sealed class ConflictAppException : AppException
    {
        public ConflictAppException(string message)
            : base(message, ErrorCode.Conflict, HttpStatusCode.Conflict) { }
    }

    public sealed class ForbiddenAppException : AppException
    {
        public ForbiddenAppException(string message = "Forbidden.")
            : base(message, ErrorCode.Forbidden, HttpStatusCode.Forbidden) { }
    }

    public sealed class UnauthorizedAppException : AppException
    {
        public UnauthorizedAppException(string message = "Unauthorized.")
            : base(message, ErrorCode.Unauthorized, HttpStatusCode.Unauthorized) { }
    }

    public sealed class BadRequestAppException : AppException
    {
        public BadRequestAppException(string message, IDictionary<string, string[]>? errors = null)
            : base(message, ErrorCode.BadRequest, HttpStatusCode.BadRequest)
        {
            _errors = errors;
        }

        private readonly IDictionary<string, string[]>? _errors;
        public override IDictionary<string, string[]>? Errors => _errors;
    }
}
