def create_postgres_connection_url(config):
    return f"postgresql://{config.username}:{config.password}@{config.host}:{config.port}/{config.database}?sslmode=require"
