# Database Microservice

A standalone microservice for secure database query execution that clients can deploy on their infrastructure.

## Overview

This microservice provides a secure, standardized API for executing database queries across multiple database types (PostgreSQL, MySQL, Snowflake, SQLite). It's designed to be deployed by clients on their own infrastructure, keeping database credentials and data within their security perimeter.

## Features

- **Multi-Database Support**: PostgreSQL, MySQL, Snowflake, SQLite
- **Secure API**: API key authentication
- **Query Validation**: SQL injection protection and query validation
- **Connection Management**: Connection pooling and caching
- **Schema Introspection**: Database metadata and schema information
- **Health Monitoring**: Health checks and service monitoring
- **Docker Ready**: Easy deployment with Docker

## Architecture

```
Client Infrastructure
├── Database Microservice (This Service)
├── PostgreSQL Database
├── MySQL Database
├── Snowflake Connection
└── SQLite Files

Your Application
├── Main Backend API
└── Client SDK (calls microservice)
```

## Quick Start

### 1. Deploy with Docker

```bash
# Clone and build
git clone <repo>
cd database-microservice
docker build -t db-microservice .

# Run with environment variables
docker run -p 8000:8000 \
  -e API_KEY=your-generated-api-key \
  -e LOG_LEVEL=INFO \
  db-microservice
```

### 2. Configure Databases

```bash
# Add a PostgreSQL database
curl -X POST http://localhost:8000/api/v1/databases \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "main_db",
    "type": "postgres",
    "config": {
      "host": "localhost",
      "port": 5432,
      "database": "mydb",
      "username": "user",
      "password": "password"
    }
  }'
```

### 3. Execute Queries

```bash
# Execute a query
curl -X POST http://localhost:8000/api/v1/databases/main_db/execute \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM users LIMIT 10"
  }'
```

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## Security

- All database credentials are encrypted at rest
- API key authentication required for all endpoints
- Query validation prevents SQL injection
- Read-only query execution by default
- Connection timeouts and rate limiting

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run in development mode
python -m uvicorn main:app --reload --port 8000

# Run tests
pytest tests/
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_KEY` | Authentication API key | Required |
| `LOG_LEVEL` | Logging level | `INFO` |
| `MAX_CONNECTIONS` | Max DB connections per database | `5` |
| `QUERY_TIMEOUT` | Query timeout in seconds | `30` |
| `ENCRYPTION_KEY` | Key for encrypting credentials | Auto-generated |

## Deployment

See `deployment/` directory for:
- Docker Compose examples
- Kubernetes manifests
- Environment configuration templates

## Support

For issues and questions, please refer to the main project documentation.
