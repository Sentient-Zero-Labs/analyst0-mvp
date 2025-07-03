"""Custom exceptions for the database microservice."""


class DatabaseServiceException(Exception):
    """Base exception for database service errors."""
    pass


class DatabaseConnectionError(DatabaseServiceException):
    """Raised when database connection fails."""
    pass


class DatabaseNotFoundError(DatabaseServiceException):
    """Raised when requested database is not found."""
    pass


class QueryValidationError(DatabaseServiceException):
    """Raised when query validation fails."""
    pass


class QueryExecutionError(DatabaseServiceException):
    """Raised when query execution fails."""
    pass


class ConfigurationError(DatabaseServiceException):
    """Raised when configuration is invalid."""
    pass


class AuthenticationError(DatabaseServiceException):
    """Raised when authentication fails."""
    pass
