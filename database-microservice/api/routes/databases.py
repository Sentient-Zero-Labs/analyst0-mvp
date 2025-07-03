"""Database management endpoints."""

from typing import List, Optional

import structlog
from core.database_manager import DatabaseManager

# Global database manager - will be set by main.py
_database_manager: DatabaseManager = None


def get_database_manager() -> DatabaseManager:
    """Get the database manager instance."""
    return _database_manager


def set_database_manager(manager: DatabaseManager):
    """Set the database manager instance."""
    global _database_manager
    _database_manager = manager


from core.exceptions import ConfigurationError, DatabaseConnectionError, DatabaseNotFoundError, QueryExecutionError
from core.models import (
    ColumnInfo,
    ConnectionTestResult,
    DatabaseConfig,
    DatabaseInfo,
    QueryRequest,
    QueryResult,
    SchemaInfo,
    TableInfo,
)
from fastapi import APIRouter, Depends, HTTPException, Path, Query

logger = structlog.get_logger()
router = APIRouter()


@router.post("/databases", status_code=201)
async def add_database(config: DatabaseConfig):
    """Add a new database configuration."""
    try:
        db_manager = get_database_manager()
        await db_manager.add_database(config)
        return {"message": f"Database '{config.name}' added successfully"}

    except ConfigurationError as e:
        logger.warning("Configuration error", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    except DatabaseConnectionError as e:
        logger.error("Database connection error", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error("Unexpected error adding database", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/databases", response_model=List[DatabaseInfo])
async def list_databases(db_manager: DatabaseManager = Depends()):
    """List all configured databases."""
    try:
        return await db_manager.list_databases()

    except Exception as e:
        logger.error("Error listing databases", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/databases/{database_name}", response_model=DatabaseInfo)
async def get_database(
    database_name: str = Path(..., description="Database name"), db_manager: DatabaseManager = Depends()
):
    """Get information about a specific database."""
    try:
        return await db_manager.get_database_info(database_name)

    except DatabaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error("Error getting database info", database=database_name, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/databases/{database_name}")
async def update_database(
    config: DatabaseConfig,
    database_name: str = Path(..., description="Database name"),
    db_manager: DatabaseManager = Depends(),
):
    """Update a database configuration."""
    try:
        await db_manager.update_database(database_name, config)
        return {"message": f"Database '{database_name}' updated successfully"}

    except DatabaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except ConfigurationError as e:
        logger.warning("Configuration error", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    except DatabaseConnectionError as e:
        logger.error("Database connection error", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error("Unexpected error updating database", database=database_name, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/databases/{database_name}")
async def remove_database(
    database_name: str = Path(..., description="Database name"), db_manager: DatabaseManager = Depends()
):
    """Remove a database configuration."""
    try:
        await db_manager.remove_database(database_name)
        return {"message": f"Database '{database_name}' removed successfully"}

    except DatabaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error("Error removing database", database=database_name, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/databases/{database_name}/test", response_model=ConnectionTestResult)
async def test_database_connection(
    database_name: str = Path(..., description="Database name"), db_manager: DatabaseManager = Depends()
):
    """Test database connection."""
    try:
        return await db_manager.test_connection(database_name)

    except DatabaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error("Error testing database connection", database=database_name, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/databases/{database_name}/execute", response_model=QueryResult)
async def execute_query(
    request: QueryRequest,
    database_name: str = Path(..., description="Database name"),
    db_manager: DatabaseManager = Depends(),
):
    """Execute a query on the specified database."""
    try:
        return await db_manager.execute_query(database_name, request)

    except DatabaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except QueryExecutionError as e:
        logger.warning("Query execution error", database=database_name, error=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error("Unexpected error executing query", database=database_name, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/databases/{database_name}/schema", response_model=SchemaInfo)
async def get_database_schema(
    database_name: str = Path(..., description="Database name"), db_manager: DatabaseManager = Depends()
):
    """Get database schema information."""
    try:
        return await db_manager.get_schema_info(database_name)

    except DatabaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error("Error getting database schema", database=database_name, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/databases/{database_name}/tables", response_model=List[TableInfo])
async def get_database_tables(
    database_name: str = Path(..., description="Database name"), db_manager: DatabaseManager = Depends()
):
    """Get list of tables in the database."""
    try:
        return await db_manager.get_tables(database_name)

    except DatabaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error("Error getting database tables", database=database_name, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/databases/{database_name}/tables/{table_name}/columns", response_model=List[ColumnInfo])
async def get_table_columns(
    database_name: str = Path(..., description="Database name"),
    table_name: str = Path(..., description="Table name"),
    schema: Optional[str] = Query(None, description="Schema name"),
    db_manager: DatabaseManager = Depends(),
):
    """Get columns for a specific table."""
    try:
        return await db_manager.get_table_columns(database_name, table_name, schema)

    except DatabaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error("Error getting table columns", database=database_name, table=table_name, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
