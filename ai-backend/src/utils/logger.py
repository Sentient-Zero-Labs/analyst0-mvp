import logging
import os

from src.settings import settings


def setup_logger():
    # Determine the logging directory based on the environment
    if settings.ENV == "local":
        log_directory = "logs"
        log_level = logging.DEBUG
    else:
        log_directory = "logs"
        log_level = logging.INFO

    # Ensure the log directory exists
    os.makedirs(log_directory, exist_ok=True)

    # Set the log file paths
    app_log_file = os.path.join(log_directory, "app.log")
    error_log_file = os.path.join(log_directory, "error.log")

    # Create formatter
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Clear any existing handlers
    root_logger.handlers = []

    # Create and configure handlers
    # File handler for all logs
    file_handler = logging.FileHandler(app_log_file)
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)

    # File handler for error logs
    error_file_handler = logging.FileHandler(error_log_file)
    error_file_handler.setFormatter(formatter)
    error_file_handler.setLevel(logging.ERROR)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)

    # Add handlers to root logger
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_file_handler)
    root_logger.addHandler(console_handler)

    logger = logging.getLogger(__name__)
    return logger


# Initialize the logger
logger = setup_logger()
