### How to start/stop server

1. First, make sure you have started the local postgres database by following the instructions below.
2. Run `docker compose up app` to start the service.
3. The service will be available at http://localhost:8000
4. Run `docker compose stop app` to stop the service.
5. Run `docker compose down` to stop the service and remove the container.

### How to start/stop local postgres database

1. Install docker desktop
2. Run `docker compose up timescaledb -d` to start the database in detached/background mode
3. Run `docker compose stop timescaledb` to stop the database
4. Run `docker compose down` to stop the database and remove the container.
   **DO NOT USE THIS COMMAND IF YOU WANT TO KEEP THE CONTAINER FOR RESTART**

### How to apply migrations using Alembic

1. First, make sure you've generated a migration script. If you haven't already, run:

```bash
alembic revision --autogenerate -m "Your migration message"
```

This will create a new migration script in your alembic/versions/ directory.

2. To apply the migrations to your database, use the following command:

```bash
alembic upgrade head
```

This will update your database schema to match the latest version defined in your models.

3. To check the current state of your database:

```bash
alembic current
```

This will display the current version of your database schema.

4. To see all available revisions:

```bash
alembic history
```

5. If you want to upgrade to a specific revision instead of the latest, you can use:

```
alembic upgrade <revision_id>
```

6. If you need to downgrade, you can use:

```bash
alembic downgrade <revision_id>
```

### How to run and setup tests

1. First, make sure you have activated your virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Unix/macOS
venv\Scripts\activate     # On Windows
```

2. Install test dependencies:
```bash
pip install pytest pytest-asyncio pytest-cov pytest-mock httpx
```

3. Run all tests:
```bash
pytest
```

4. Run tests with coverage report:
```bash
pytest --cov=src
```

5. Run specific test file:
```bash
pytest tests/path/to/test_file.py
```

6. Run tests with verbose output:
```bash
pytest -v
```

#### Test Database Setup

The tests use SQLite in-memory database by default for testing, which means:
- No need to set up a separate test database
- Tests run in isolation
- Each test gets a fresh database instance

#### Writing Tests

1. Test files should be placed in the `tests/` directory mirroring the structure of `src/`
2. Test files should be named `test_*.py`
3. Test functions should be named `test_*`
4. Use fixtures for common setup:
   ```python
   @pytest.fixture
   async def test_user(db: AsyncSession):
       user = UserModel(email="test@example.com")
       db.add(user)
       await db.commit()
       return user
   ```

5. For async tests, use the `@pytest.mark.asyncio` decorator:
   ```python
   @pytest.mark.asyncio
   async def test_something():
       # Your test code here
       pass
   ```

6. Mock external services and dependencies using `@pytest.fixture` and `unittest.mock`:
   ```python
   @pytest.fixture
   def mock_service():
       with patch("path.to.service") as mock:
           mock.some_method.return_value = "mocked_value"
           yield mock
   ```

#### Common Test Fixtures

The following fixtures are available for testing:
- `db`: AsyncSession for database operations
- `client`: AsyncClient for making HTTP requests
- `test_user`: A test user instance
- `test_organisation`: A test organisation instance
- `auth_headers`: Authentication headers with a valid JWT token

Example usage:
```python
@pytest.mark.asyncio
async def test_endpoint(client, test_organisation, auth_headers):
    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/endpoint",
        headers=auth_headers
    )
    assert response.status_code == 200
```

