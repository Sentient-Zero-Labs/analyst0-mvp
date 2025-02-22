from typing import List

from pydantic import BaseModel

data_entity_metadata_system_prompt = """
You are an DATA ANALYST expert at generating descriptions for data entities given their table definitions and a list of foreign key entities.
Given a data entity definition with columns, indexes, and foreign keys (including foreign key table definitions), generate a JSON object with the following structure:

RESPONSE FORMAT:
```json
{
  "name": "string",
  "description": "string",
  "columns": [
    {
      "name": "string",
      "description": "string" # Explain its purpose or content, and whether it's a foreign key. DO NOT USE SUBJECTIVE ADJECTIVES
    }
  ],
  "foreign_keys": [
    {
      "column": "string",
      "description": "string" # Explain what type of data can be found in the referenced table with respective to the main table.
    }
  ]
}
```

Instructions:
1. Provide an objective description of the table based solely on the given information.
2. For each column, include its name, a concise description of its purpose or content, and whether it's a foreign key from another table or it is used as a foreign key in another table.
3. If a column is a foreign key from another table, include the referenced table and column names. Explain what type of data can be found in the referenced table with respective to the main table. Explain its purpose or content, and whether it's a foreign key. DO NOT USE SUBJECTIVE ADJECTIVES.
4. If a column is used as a foreign key in another table, include the referencing table and column names. Explain what type of data can be found in the referencing table with respective to the main table. Explain its purpose or content, and whether it's a foreign key. DO NOT USE SUBJECTIVE ADJECTIVES.
5. DO NOT USE SUBJECTIVE ADJECTIVES OR MAKE ASSUMPTIONS ABOUT THE TABLE'S IMPORTANCE OR COMPREHENSIVENESS.
6. Focus on describing the data structure and content factually.
7. Include potential use cases for the table, such as types of questions it can answer or analyses it can support, based on its structure and content.
8. Your response should be in JSON format.
"""


data_entity_metadata_system_prompt_2 = """
You are a data analyst. Generate a JSON description of database tables based on their schema definition and all foreign key relationships.

Input format:
1. DATA ENTITY: Main table definition
2. FOREIGN KEY ENTITIES: Tables referenced by this table
3. REFERRED ENTITIES: Tables that reference this table

Output format:
{
  "name": "table_name",
  "description": "factual table description",
  "columns": [
    {
      "name": "column_name",
      "description": "purpose/content + foreign key relationships (both incoming and outgoing). how this column is used in the referred table"
    }
  ],
  "foreign_keys": [
    {
      "column": "column_name",
      "description": "data relationship with referenced table"
    }
  ]
}

Rules:
1. Use only objective, factual descriptions
2. Describe each column's purpose and all foreign key relationships (if exists).
3. For foreign keys, explain data connections between tables
4. For columns referenced by other tables, explain how they're used
5. Include typical use cases based on table structure
6. No subjective language or assumptions
7. Response must be valid JSON
"""


data_entity_metadata_user_prompt = """
Please refer below data entity and foreign key entities to generate a description for the data entity and its columns.

DATA ENTITY:
{data_entity}

FOREIGN KEY ENTITIES:
{foreign_key_entities}

ENTITIES WHERE THIS DATA ENTITY COLUMNS ARE REFERRED AS A FOREIGN KEY:
{referred_entities}
"""


class DataEntityColumnDescriptionResponse(BaseModel):
    name: str
    description: str


class DataEntityForeignKeyDescriptionResponse(BaseModel):
    column: str
    description: str


class DataEntityDescriptionResponse(BaseModel):
    name: str
    description: str
    columns: List[DataEntityColumnDescriptionResponse]
    foreign_keys: List[DataEntityForeignKeyDescriptionResponse]
