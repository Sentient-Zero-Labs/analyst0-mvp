#!/usr/bin/env python3
"""Simple test script for the database microservice."""

import asyncio
import json
import httpx
import time


class MicroserviceClient:
    """Simple client for testing the microservice."""
    
    def __init__(self, base_url: str = "http://localhost:8000", api_key: str = "test-api-key-12345"):
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def health_check(self):
        """Test health check endpoint."""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/health")
            return response.status_code, response.json()
    
    async def get_service_info(self):
        """Get service information."""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/info")
            return response.status_code, response.json()
    
    async def add_database(self, config):
        """Add a database configuration."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/databases",
                headers=self.headers,
                json=config
            )
            return response.status_code, response.json() if response.status_code != 422 else response.text
    
    async def list_databases(self):
        """List all databases."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/v1/databases",
                headers=self.headers
            )
            return response.status_code, response.json()
    
    async def test_connection(self, database_name):
        """Test database connection."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/databases/{database_name}/test",
                headers=self.headers
            )
            return response.status_code, response.json()
    
    async def execute_query(self, database_name, query, params=None):
        """Execute a query."""
        async with httpx.AsyncClient() as client:
            payload = {"query": query}
            if params:
                payload["params"] = params
            
            response = await client.post(
                f"{self.base_url}/api/v1/databases/{database_name}/execute",
                headers=self.headers,
                json=payload
            )
            return response.status_code, response.json()


async def test_microservice():
    """Run basic tests on the microservice."""
    client = MicroserviceClient()
    
    print("🚀 Testing Database Microservice")
    print("=" * 50)
    
    # Test health check
    print("\n1. Testing health check...")
    try:
        status, data = await client.health_check()
        print(f"   Status: {status}")
        print(f"   Response: {json.dumps(data, indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test service info
    print("\n2. Testing service info...")
    try:
        status, data = await client.get_service_info()
        print(f"   Status: {status}")
        print(f"   Response: {json.dumps(data, indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test adding a SQLite database (easiest to test)
    print("\n3. Testing database addition (SQLite)...")
    sqlite_config = {
        "name": "test_sqlite",
        "type": "sqlite",
        "config": {
            "database_path": ":memory:"
        }
    }
    
    try:
        status, data = await client.add_database(sqlite_config)
        print(f"   Status: {status}")
        print(f"   Response: {data}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test listing databases
    print("\n4. Testing database listing...")
    try:
        status, data = await client.list_databases()
        print(f"   Status: {status}")
        print(f"   Response: {json.dumps(data, indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test connection
    print("\n5. Testing database connection...")
    try:
        status, data = await client.test_connection("test_sqlite")
        print(f"   Status: {status}")
        print(f"   Response: {json.dumps(data, indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test query execution
    print("\n6. Testing query execution...")
    try:
        status, data = await client.execute_query("test_sqlite", "SELECT 1 as test_column")
        print(f"   Status: {status}")
        print(f"   Response: {json.dumps(data, indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")


if __name__ == "__main__":
    print("Starting microservice tests...")
    print("Make sure the microservice is running on http://localhost:8000")
    print("You can start it with: python main.py")
    print()
    
    asyncio.run(test_microservice())
