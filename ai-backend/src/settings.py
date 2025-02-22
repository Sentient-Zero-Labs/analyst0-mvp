from pydantic_settings import BaseSettings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Auth"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    # Tokens
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    VERIFICATION_TOKEN_EXPIRE_MINUTES: int

    ENV: str = "local"
    CURRENT_SERVER_URL: str

    # SLACK_BOT_TOKEN: str
    SLACK_EARLY_ACCESS_USERS_WEBHOOK_URL: str
    SLACK_ERRORS_WEBHOOK_URL: str

    SLACK_SIGNING_SECRET: str

    SLACK_CLIENT_ID: str
    SLACK_CLIENT_SECRET: str

    # This is not provided by Slack, we use this key to encrypt the state in the OAuth flow and decrypt it in the callback
    SLACK_STATE_ENCRYPTION_KEY: str

    FRONTEND_URL: str

    # PostgreSQL connection details
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    GROQ_API_KEY: str
    OPENAI_API_KEY: str
    CLAUDE_API_KEY: str

    # Email
    VERIFICATION_EMAIL_SENDER: str
    SENDGRID_API_KEY: str
    SENDGRID_SECRET_KEY: str

    SSL_CERT_PATH: str

    DATA_SOURCE_CONNECTOR_CACHE_MAXSIZE: int

    TRY_IT_OUT_ORGANISATION_ID: int
    TRY_IT_OUT_CHARTER_IDS_STR: str

    SUPER_ADMIN_EMAILS_STR: str

    IS_BENCHMARK_MODE: bool = False

    DEFAULT_QUERY_LIMIT: int = 100
    DEFAULT_QUERY_TIMEOUT: int = 120

    @property
    def SUPER_ADMIN_EMAILS(self):
        return [email.strip() for email in self.SUPER_ADMIN_EMAILS_STR.split(",")]

    @property
    def TRY_IT_OUT_CHARTER_IDS(self):
        return [int(id) for id in self.TRY_IT_OUT_CHARTER_IDS_STR.split(",")]

    @property
    def DATABASE_URL(self):
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    @property
    def ASYNC_DATABASE_URL(self):
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    class Config:
        env_file = ".env"


settings = Settings()

# Use the DATABASE_URL from settings instead
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
