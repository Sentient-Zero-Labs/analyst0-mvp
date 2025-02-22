import requests

from src.services.early_access_users.early_access_users_schema import EarlyAccessUserCreateSchema
from src.settings import settings
from src.utils.logger import logger


def send_error_to_slack(error_id, error_message, traceback_info):
    """
    Send error details to Slack using a webhook
    """
    try:
        # Split traceback into chunks if too long
        max_length = 15000
        traceback_chunks = []

        if len(traceback_info) > max_length:
            # Split traceback into chunks of max_length
            for i in range(0, len(traceback_info), max_length):
                traceback_chunks.append(traceback_info[i : i + max_length])
        else:
            traceback_chunks = [traceback_info]

        # Create fields array with error message and all traceback chunks
        fields = [{"title": f"❌ Application Error ({error_id})", "value": error_message}]

        for i, chunk in enumerate(traceback_chunks, 1):
            fields.append({"title": f"Traceback: Part {i}/{len(traceback_chunks)}", "value": f"```{chunk}```"})

        # Send single message with all fields
        message = {"attachments": [{"color": "#FF0000", "fields": fields}]}

        response = requests.post(settings.SLACK_ERRORS_WEBHOOK_URL, json=message)
        response.raise_for_status()

    except Exception as slack_error:
        logger.error(f"Failed to send error to Slack: {slack_error}")


def send_early_access_user_to_slack(early_access_user: EarlyAccessUserCreateSchema):
    """
    Send early access user details to Slack using a webhook
    """

    if early_access_user.usage_type is None:
        fields = [
            {"value": f"User Email: *{early_access_user.email}*"},
        ]
    else:
        fields = [
            {"value": f"User Email: *{early_access_user.email}*"},
            {"value": f"Usage Type: *{early_access_user.usage_type.value}*"},
            {"value": f"Interested Feature: *{early_access_user.usage_feature.value}*"},
            {"value": f"Explanation: {early_access_user.explanation}"},
        ]
    try:
        slack_message = {
            "text": "🚀 New Early Access User",
            "attachments": [
                {
                    "color": "#0f9013",
                    "fields": fields,
                }
            ],
        }

        response = requests.post(settings.SLACK_EARLY_ACCESS_USERS_WEBHOOK_URL, json=slack_message)
        response.raise_for_status()
    except Exception as slack_error:
        logger.error(f"Failed to send error to Slack: {slack_error}")


def send_new_user_registered_to_slack(email: str):
    """
    Send new user registered details to Slack using a webhook
    """
    try:
        slack_message = {
            "text": "🚀 New User Registered",
            "attachments": [{"color": "#0f9013", "fields": [{"value": f"User Email: *{email}*"}]}],
        }

        response = requests.post(settings.SLACK_EARLY_ACCESS_USERS_WEBHOOK_URL, json=slack_message)
        response.raise_for_status()
    except Exception as slack_error:
        logger.error(f"Failed to send error to Slack: {slack_error}")
