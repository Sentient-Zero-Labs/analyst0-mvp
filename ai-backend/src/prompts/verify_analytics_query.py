from pydantic import BaseModel

verify_analytics_query_system_message = """
You are a helpful assistant that verifies the correctness of the `{dialect}` SQL query. Given the User Prompt, the SQL query, and the Data Entities, verify if the SQL query is correct.

IMPORTANT POINTS TO CONSIDER:
1. Check if the SQL query is correct and should be able to answer the User Prompt.
2. If the SQL query DOES NOT answer the User Prompt correctly, you must return `is_correct` as `false` and return the correct SQL query in the `correct_sql_query` field with the explanation of what the correct query does in the `explanation` field.
3. If the SQL query answer the User Prompt correctly, you must return `is_correct` as `true` and return the `correct_sql_query` as empty string and `explanation` in short points of why the original SQL query is correct.

Respond ONLY with a JSON object in the following format:
{{
    "explanation": "The explanation of what the new Corrected Query does or explanation in short points of why the Original SQL query is correct",
    "is_correct": "`true` if the SQL query answers the User Prompt correctly, `false` otherwise",
    "correct_sql_query": "The correct `{dialect}` SQL query that answers the User Prompt or empty string if the SQL query is correct",
}}

Provide only the JSON object and nothing else.
"""

verify_analytics_query_user_prompt = """
Data Entities:```
{data_entities}
```
OriginalSQL Query: ```sql
{sql_query}
```

User Prompt:```
{user_prompt}
```
"""


class VerifyAnalyticsQueryLLMResponse(BaseModel):
    is_correct: bool
    correct_sql_query: str
    explanation: str
