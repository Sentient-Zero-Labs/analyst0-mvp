import enum
from urllib.parse import quote_plus

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB

from src.database import Base


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
    config = Column(JSONB, nullable=False)
    type = Column(Enum(DataSourceType), nullable=False)
    deleted_at = Column(DateTime)

    def soft_delete(self):
        self.deleted_at = func.now()

    def get_connection_url(self) -> str:
        if self.type == DataSourceType.POSTGRES:
            return f"postgresql://{self.config['username']}:{quote_plus(self.config['password'])}@{self.config['host']}:{self.config['port']}/{self.config['database']}"
        elif self.type == DataSourceType.MYSQL:
            return f"mysql+pymysql://{self.config['username']}:{quote_plus(self.config['password'])}@{self.config['host']}:{self.config['port']}/{self.config['database']}"
        elif self.type == DataSourceType.SQLITE:
            return f"sqlite:///{self.config['database_path']}"
        elif self.type == DataSourceType.SNOWFLAKE:
            snowflake_uri = f"snowflake://{self.config['username']}:{quote_plus(self.config['password'])}@{self.config['account_identifier']}/{self.config['database']}"

            if self.config["schema"]:
                snowflake_uri += f"/{self.config['schema']}"

            snowflake_uri += f"?warehouse={self.config['warehouse']}"

            if self.config["role"]:
                snowflake_uri += f"&role={self.config['role']}"
            return snowflake_uri

        raise ValueError(f"Unsupported data source type: {self.type}")
