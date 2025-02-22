import traceback

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.internal_services.slack.slack_service import send_error_to_slack
from src.utils.logger import logger
from src.utils.uuid import generate_uuid


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    error_id = generate_uuid(10)
    logger.error(f"HTTP Exception ({error_id}) - {exc.status_code} - {exc} - {traceback.format_exc()}")

    if exc.status_code >= 500 and exc.status_code < 600:
        send_error_to_slack(error_id, str(exc), traceback.format_exc())
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": "Internal Server Error"},
        )

    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


async def general_exception_handler(request: Request, exc: Exception):
    error_id = generate_uuid(10)
    logger.error(f"General Exception ({error_id}) - {exc} - {traceback.format_exc()}")
    send_error_to_slack(error_id, str(exc), traceback.format_exc())

    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error"},
    )


async def data_response_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Data Response Exception: {exc} - {traceback.format_exc()}")

    return JSONResponse(
        status_code=422,
        content={"error": exc.errors()},
    )
