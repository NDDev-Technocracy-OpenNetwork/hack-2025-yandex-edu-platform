from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import structlog
import traceback

logger = structlog.get_logger()


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Unhandled exception",
                exception=str(e),
                path=request.url.path,
                method=request.method,
                traceback=traceback.format_exc()
            )
            
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error_code": "INTERNAL_SERVER_ERROR",
                    "message": "Internal server error occurred"
                }
            )


def setup_error_handling(app: FastAPI) -> None:
    app.add_middleware(ErrorHandlingMiddleware)