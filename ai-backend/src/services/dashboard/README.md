# Dashboard Service

This service provides functionality to manage dashboards and their associated queries for organizations.

## API Endpoints

### Dashboard Endpoints

```
POST /organisations/{organisation_public_id}/dashboards
GET /organisations/{organisation_public_id}/dashboards
GET /organisations/{organisation_public_id}/dashboards/{dashboard_id}
PUT /organisations/{organisation_public_id}/dashboards/{dashboard_id}
DELETE /organisations/{organisation_public_id}/dashboards/{dashboard_id}
```

### Dashboard Query Endpoints

```
POST /organisations/{organisation_public_id}/dashboards/{dashboard_id}/queries
GET /organisations/{organisation_public_id}/dashboards/{dashboard_id}/queries
GET /organisations/{organisation_public_id}/dashboards/{dashboard_id}/queries/{query_id}
PUT /organisations/{organisation_public_id}/dashboards/{dashboard_id}/queries/{query_id}
DELETE /organisations/{organisation_public_id}/dashboards/{dashboard_id}/queries/{query_id}
```

## Schema Structure

### Dashboard Schemas

#### Input Schemas

```python
DashboardCreate:
  - title: str
  - description: Optional[str]
  - tags: Optional[List[str]]

DashboardUpdate:
  - title: Optional[str]
  - description: Optional[str]
  - tags: Optional[List[str]]
```

#### Response Schemas

```python
DashboardResponse:
  - id: int
  - title: str
  - description: Optional[str]
  - tags: Optional[List[str]]
  - organisation_id: int
  - created_at: datetime
  - updated_at: datetime
  - queries: Optional[List[DashboardQueryResponse]]

DashboardListResponse:
  - id: int
  - title: str
  - description: Optional[str]
  - tags: Optional[List[str]]
  - organisation_id: int
  - created_at: datetime
  - updated_at: datetime
  - query_count: int
```

### Dashboard Query Schemas

#### Input Schemas

```python
DashboardQueryCreate:
  - title: str
  - description: Optional[str]
  - query: str
  - data_source_id: int
  - query_metadata: Optional[dict]

DashboardQueryUpdate:
  - title: Optional[str]
  - description: Optional[str]
  - query: Optional[str]
  - data_source_id: Optional[int]
  - query_metadata: Optional[dict]
```

#### Response Schema

```python
DashboardQueryResponse:
  - id: int
  - dashboard_id: int
  - data_source_id: int
  - title: str
  - description: Optional[str]
  - query: str
  - query_metadata: Optional[dict]
  - created_at: datetime
  - updated_at: datetime
```

## Response Format

### Success Response

All successful responses are wrapped in a `DataResponse` structure:

```json
{
    "data": {
        // Actual response data here
    }
}
```

### Error Response

Error responses follow this format:

```json
{
    "error": {
        "detail": "Error message here"
    }
}
```

## Tests

The service includes comprehensive tests covering all endpoints and error cases.

### Dashboard Tests

```python
test_create_dashboard:
  - Creates a new dashboard
  - Verifies response structure and data
  - Checks if title, description, and tags match input

test_get_dashboards:
  - Retrieves all dashboards for an organization
  - Verifies list response
  - Checks dashboard properties

test_get_dashboard:
  - Retrieves a specific dashboard by ID
  - Verifies response structure
  - Checks dashboard properties

test_update_dashboard:
  - Updates dashboard properties
  - Verifies updated fields
  - Checks response structure

test_delete_dashboard:
  - Deletes a dashboard
  - Verifies 204 status code
```

### Dashboard Query Tests

```python
test_create_dashboard_query:
  - Creates a new query for a dashboard
  - Verifies query properties
  - Checks response structure

test_get_dashboard_queries:
  - Retrieves all queries for a dashboard
  - Verifies list response
  - Checks query properties

test_get_dashboard_query:
  - Retrieves a specific query
  - Verifies query properties
  - Checks response structure

test_update_dashboard_query:
  - Updates query properties
  - Verifies updated fields
  - Checks response structure

test_delete_dashboard_query:
  - Deletes a query
  - Verifies 204 status code
```

### Error Case Tests

```python
test_get_dashboard_not_found:
  - Attempts to get non-existent dashboard
  - Verifies 404 status code
  - Checks error response format

test_get_dashboard_query_not_found:
  - Attempts to get non-existent query
  - Verifies 404 status code
  - Checks error response format
```

### Test Fixtures

The tests use several fixtures to set up the test environment:

```python
test_user: Creates a test user
test_organisation: Creates a test organization
test_organisation_user: Links user to organization
test_data_source: Creates a test data source
test_dashboard: Creates a test dashboard
test_dashboard_query: Creates a test dashboard query
auth_headers: Generates authentication headers
```

## Models

### DashboardModel

The dashboard model represents a dashboard in the database:

```python
DashboardModel:
  - id: Integer (Primary Key)
  - title: String
  - description: String
  - tags: Array[String]
  - organisation_id: Integer
  - created_at: DateTime
  - updated_at: DateTime
  - deleted_at: DateTime
  - queries: Relationship[DashboardQueryModel]
```

### DashboardQueryModel

The dashboard query model represents a query associated with a dashboard:

```python
DashboardQueryModel:
  - id: Integer (Primary Key)
  - dashboard_id: Integer (Foreign Key)
  - data_source_id: Integer
  - title: String
  - description: String
  - query: String
  - query_metadata: JSONB
  - created_at: DateTime
  - updated_at: DateTime
  - deleted_at: DateTime
  - dashboard: Relationship[DashboardModel]
```

## Service Layer

The `DashboardService` class provides methods to interact with dashboards and queries:

```python
DashboardService:
  - create_dashboard(organisation_id, dashboard_create, db)
  - update_dashboard(dashboard_id, organisation_id, dashboard_update, db)
  - delete_dashboard(dashboard_id, organisation_id, db)
  - get_dashboard(db, dashboard_id, organisation_id)
  - get_dashboards(organisation_id, db)
  - create_dashboard_query(dashboard_id, query_create, db)
  - update_dashboard_query(query_id, dashboard_id, query_update, db)
  - delete_dashboard_query(query_id, dashboard_id, db)
  - get_dashboard_query(db, query_id, dashboard_id)
  - get_dashboard_queries(dashboard_id, db)
```

Each method handles the corresponding database operations and includes proper error handling. 