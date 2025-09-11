from .cors_middleware import setup_cors
from .error_middleware import setup_error_handling

__all__ = ["setup_cors", "setup_error_handling"]