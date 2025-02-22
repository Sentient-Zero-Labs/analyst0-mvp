import enum
from typing import Any, Dict
from urllib.parse import quote_plus

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB

from src.database import Base
from src.utils.logger import logger
from src.utils.security import decrypt_value, encrypt_value


class DataSourceType(enum.Enum):
    POSTGRES = "postgres"
    MYSQL = "mysql"
    SNOWFLAKE = "snowflake"
    SQLITE = "sqlite"


class DataSourceModel(Base):
    __tablename__ = "data_source"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id"), index=True)
    _config = Column("config", JSONB, nullable=False)
    type = Column(Enum(DataSourceType), nullable=False)
    deleted_at = Column(DateTime)

    @property
    def config(self) -> Dict[str, Any]:
        """Decrypt sensitive values when reading config"""
        if self._config is None:
            return {}

        # Check if we already have decrypted values
        if any(isinstance(v, (int, float)) for v in self._config.values()):
            logger.debug("Config already contains decrypted values")
            return self._config

        logger.debug(f"Raw config before decryption: {self._config}")
        decrypted_config = {}
        for key, value in self._config.items():
            try:
                decrypted_value = decrypt_value(value)

                # Type conversion for numeric values
                if isinstance(decrypted_value, str):
                    try:
                        if decrypted_value.isdigit():
                            decrypted_value = int(decrypted_value)
                        elif (
                            "." in decrypted_value
                            and decrypted_value.replace(".", "").isdigit()
                        ):
                            decrypted_value = float(decrypted_value)
                    except (ValueError, TypeError):
                        pass

                decrypted_config[key] = decrypted_value
            except Exception:
                decrypted_config[key] = value

        return decrypted_config

    @config.setter
    def config(self, value: Dict[str, Any]):
        """Encrypt sensitive values before storing config"""
        if value is None:
            self._config = {}
            return

        # Convert Pydantic model to dict if needed
        if hasattr(value, "model_dump"):
            value = value.model_dump()

        # Check if values are already encrypted
        if any(isinstance(v, str) and v.startswith("gAAAAA") for v in value.values()):
            logger.debug("Config already contains encrypted values")
            self._config = value
            return

        logger.debug(f"Original config before encryption: {value}")
        encrypted_config = {}

        try:
            for key, val in value.items():
                try:
                    str_val = str(val) if val is not None else ""
                    encrypted_val = encrypt_value(str_val)
                    encrypted_config[key] = encrypted_val
                except Exception as e:
                    logger.error(f"Error encrypting {key}: {e}")
                    encrypted_config[key] = val
        except AttributeError as e:
            logger.error(
                f"Error accessing config values: {e}. Value type: {type(value)}"
            )
            raise ValueError(
                f"Invalid config format. Expected dictionary or Pydantic model, got {type(value)}"
            )

        logger.debug(f"Final encrypted config: {encrypted_config}")
        self._config = encrypted_config

    def soft_delete(self):
        self.deleted_at = func.now()

    def get_connection_url(self) -> str:
        """Get database connection URL using decrypted config"""
        logger.debug(f"Building connection URL for type: {self.type}")

        # Get decrypted config once and store it
        decrypted_config = self.config
        logger.debug(f"Using decrypted config for connection: {decrypted_config}")

        if self.type == DataSourceType.POSTGRES:
            # Remove http:// or https:// from host if present
            host = decrypted_config["host"]
            if "://" in host:
                host = host.split("://")[-1]
            host = host.rstrip("/")

            # Ensure port is an integer
            port = decrypted_config.get("port", 5432)
            if isinstance(port, str):
                port = int(port) if port.isdigit() else 5432

            url = f"postgresql://{decrypted_config['username']}:{quote_plus(decrypted_config['password'])}@{host}:{port}/{decrypted_config['database']}"
            return url
        elif self.type == DataSourceType.MYSQL:
            host = decrypted_config["host"]
            if "://" in host:
                host = host.split("://")[-1]
            host = host.rstrip("/")

            port = decrypted_config.get("port", 3306)
            if isinstance(port, str):
                port = int(port) if port.isdigit() else 3306

            return f"mysql+pymysql://{decrypted_config['username']}:{quote_plus(decrypted_config['password'])}@{host}:{port}/{decrypted_config['database']}"
        elif self.type == DataSourceType.SQLITE:
            return f"sqlite:///{decrypted_config['database_path']}"
        elif self.type == DataSourceType.SNOWFLAKE:
            snowflake_uri = f"snowflake://{decrypted_config['username']}:{quote_plus(decrypted_config['password'])}@{decrypted_config['account_identifier']}/{decrypted_config['database']}"

            if decrypted_config.get("schema"):
                snowflake_uri += f"/{decrypted_config['schema']}"

            snowflake_uri += f"?warehouse={decrypted_config['warehouse']}"

            if decrypted_config.get("role"):
                snowflake_uri += f"&role={decrypted_config['role']}"
            return snowflake_uri

        raise ValueError(f"Unsupported data source type: {self.type}")