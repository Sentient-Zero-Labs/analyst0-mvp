from datetime import datetime, timedelta
from typing import Tuple

import jwt
from fastapi import BackgroundTasks
from fastapi.templating import Jinja2Templates
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from src.settings import settings
from src.utils.logger import logger
from src.utils.security import create_token

templates = Jinja2Templates(directory="src/email_templates")


class AuthService:
    @staticmethod
    def create_verification_token(data: dict):
        token, expires_in = create_token(
            data, timedelta(minutes=settings.VERIFICATION_TOKEN_EXPIRE_MINUTES), token_type="verify"
        )

        return token, expires_in

    @staticmethod
    def create_access_token(data: dict) -> Tuple[str, int]:
        to_encode = data.copy()
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        expires = datetime.utcnow() + expires_delta
        to_encode.update(
            {
                "exp": expires.timestamp(),
                "type": "access",  # Add token type
            }
        )
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt, int(expires.timestamp())

    @staticmethod
    def create_refresh_token(data: dict):
        return create_token(data, timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS), token_type="refresh")

    @staticmethod
    def create_and_send_verification_email(email, background_tasks: BackgroundTasks):
        # Create verification token
        verification_token, token_expires = AuthService.create_verification_token({"sub": email})

        # Send verification email in background
        verification_url = f"{settings.FRONTEND_URL}/auth/verify-email?token={verification_token}"

        background_tasks.add_task(
            AuthService.send_verification_email, to_email=email, verification_url=verification_url
        )

    @staticmethod
    async def send_verification_email(to_email: str, verification_url: str):
        # Set up the email content
        subject = "Verify Your Email"
        from_email = settings.VERIFICATION_EMAIL_SENDER

        template = templates.get_template("email_verification.html")
        html_content = template.render(verification_link=verification_url)

        # Create the email message
        message = Mail(from_email=from_email, to_emails=to_email, subject=subject, html_content=html_content)

        try:
            # Send the email using SendGrid API Client
            sg = SendGridAPIClient(
                settings.SENDGRID_SECRET_KEY
            )  # Ensure your API key is set as an environment variable
            sg.send(message)

        except Exception as e:
            logger.error(f"Failed to send email: {e}")
