namespace ScribeApi.Core.Exceptions;

public class AuthenticationException : Exception
{
    public AuthenticationException(string message) : base(message) { }
}

public class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
}

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }
}

public class OAuthException : Exception
{
    public OAuthException(string message) : base(message) { }
    public OAuthException(string message, Exception innerException) : base(message, innerException) { }
}

public class AccountLinkingException : Exception
{
    public AccountLinkingException(string message) : base(message) { }
}

public class PlanLimitExceededException : Exception
{
    public PlanLimitExceededException(string message) : base(message) { }
}

public class TranscriptionException : Exception
{
    public TranscriptionException(string message) : base(message) { }
    public TranscriptionException(string message, Exception inner) : base(message, inner) { }
}

public class StorageException : Exception
{
    public StorageException(string message) : base(message) { }
    public StorageException(string message, Exception inner) : base(message, inner) { }
}

public class ConcurrencyException : Exception
{
    public ConcurrencyException(string message) : base(message) { }
    public ConcurrencyException(string message, Exception inner) : base(message, inner) { }
}

public class RequestTimeoutException : Exception
{
    public RequestTimeoutException(string message) : base(message) { }
    public RequestTimeoutException(string message, Exception inner) : base(message, inner) { }
}
