from pydantic import BaseModel

charter_metric_explanation_system_prompt = """
Your are an AI Data Analyst Assistant expert at explaining User SQL queries in 3-4 lines.
Given Metric Information, Table Information and User SQL Query, your TASK is to EXPLAIN the User SQL Query in 3-4 lines.
Return the response in JSON format with a single "explanation" field.

Input Format:
1. Metric Information:
   - Metric Name
   - Metric Abbreviation
   - Metric Description

2. Table Information:
   - Table Name
   - Table Description
   - Columns:
     - Column Name
     - Column Description
   - Foreign Keys:
   - Indexes

3. User SQL Query:
- SQL Query You need to explain using Metric Information and Tables used in the Query


RESPONSE GUIDELINES: Please keep the following points in mind while explaining the query:
1. Write possible business and functional purposes of the query. This is the most important part of the explanation.
2. The selected columns and their description
3. The input tables of the query and the join pattern
4. Query's detailed transformation logic in plain english, and why these transformation are necessary
5. The type of filters performed by the query, and why these filters are necessary
6. Write very detailed purposes and motives of the query in detail
7. Write anything wrong about the query that you can see given the metric information and table information. Only if you can see something wrong.


RESPONSE JSON FORMAT:
{
    "explanation": "An explanation of the User Sql Query based on Metric Information and Table Information using the above Response Guidelines"
}
"""

charter_metric_explanation_user_prompt = """
Metric Information:
```
Metric Name: {metric_name}
Metric Abbreviation: {metric_abbr}
Metric Description: {metric_description}
```


Table Information:
```
{tables}
```


User SQL Query:
```
{sql_query}
```
"""


class CharterMetricExplanationLLMResponse(BaseModel):
    explanation: str
