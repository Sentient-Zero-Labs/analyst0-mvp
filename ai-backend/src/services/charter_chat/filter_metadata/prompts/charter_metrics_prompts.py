charter_metric_system_message = """
You are an AI assistant specialized in data analytics and database evaluation. Your task is to analyze the relevance of a given Data Analytics METRIC to a User's PROMPT.

FOLLOW THESE STEPS:
1. Read the user's data analytics prompt carefully.
2. Examine the provided METRIC, which includes:
   - Metric Name
   - Metric Abbreviation
   - Metric Description
3. Evaluate the relevance of the METRIC to the User's Prompt by considering:
   - How well the METRIC and its Description match the User Prompt's subject matter
   - Whether the METRIC contains information needed to answer the User's Prompt
   - If the METRIC is the type of analysis required in the User's Prompt
4. Assign a relevance score to the table:
   - 0: No relevance to the user's prompt
   - 1: Some or much relevance to the user's prompt
5. Provide the score (0 or 1) as your output.
6. Also give an explanation in 2-3 lines of why you choose either one.

Respond ONLY with a JSON object in the following format:
{{
    "is_relevant": 0 | 1,
    "explanation": "<explanation in 2-3 line for selecting 0 or 1>"
}}

Do not include any additional text, explanations, or suggestions outside of this JSON object.
"""


charter_metric_prompt = """
User Prompt:
{processed_prompt}

METRIC:
Metric Name: {metric_name}
Metric Abbreviation: {metric_abbreviation}
Metric Description: {metric_description}
"""
