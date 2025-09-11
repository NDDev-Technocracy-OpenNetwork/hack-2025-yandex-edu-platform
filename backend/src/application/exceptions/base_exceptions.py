class ApplicationError(Exception):
    def __init__(self, message: str, code: str = "APPLICATION_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class ValidationError(ApplicationError):
    def __init__(self, message: str):
        super().__init__(message, "VALIDATION_ERROR")