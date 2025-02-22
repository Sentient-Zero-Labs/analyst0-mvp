from typing import List, Optional

from sqlalchemy.orm import Session

from src.services.charter_playground.charter_playground_model import CharterPlaygroundModel
from src.services.charter_playground.charter_playground_schema import (
    CharterPlaygroundUpdate,
)
from src.utils.logger import setup_logger

logger = setup_logger()

system_message = """
You are an AI assistant specializing in database analytics for {dialect}.
Your task is to answer the user's question based on the provided table and business metric,
SQL query and User Selected Snippets context if available.
"""

user_prompt_template = """
Tables JSON Context:
```
{data_entities_and_examples}
```

Business Metrics JSON Context:
```
{charter_metrics_and_examples}
```

Query:
```
{sql_query}
```

```
{user_content}
```
"""


class CharterPlaygroundService:
    @staticmethod
    def create_charter_playground(charter_id: int, user_id: int, db: Session) -> CharterPlaygroundModel:
        db_charter_playground = CharterPlaygroundModel(charter_id=charter_id, user_id=user_id)

        db_charter_playground.name = "Untitled Playground"
        db_charter_playground.query = ""

        db.add(db_charter_playground)
        db.commit()
        db.refresh(db_charter_playground)

        return db_charter_playground

    @staticmethod
    def get_charter_playground(
        charter_playground_public_id: str, charter_id: int, db: Session
    ) -> Optional[CharterPlaygroundModel]:
        return (
            db.query(CharterPlaygroundModel)
            .filter(
                CharterPlaygroundModel.public_id == charter_playground_public_id,
                CharterPlaygroundModel.charter_id == charter_id,
            )
            .first()
        )

    @staticmethod
    def get_charter_playgrounds_list(charter_id: int, db: Session) -> List[CharterPlaygroundModel]:
        return (
            db.query(CharterPlaygroundModel)
            .filter(CharterPlaygroundModel.charter_id == charter_id)
            .order_by(CharterPlaygroundModel.created_at.desc())
            .all()
        )

    @staticmethod
    def update_charter_playground(
        charter_playground_public_id: str,
        charter_id: int,
        charter_playground_update: CharterPlaygroundUpdate,
        db: Session,
    ) -> Optional[CharterPlaygroundModel]:
        db_charter_playground = CharterPlaygroundService.get_charter_playground(
            charter_playground_public_id, charter_id, db
        )

        if db_charter_playground:
            for key, value in charter_playground_update.model_dump().items():
                setattr(db_charter_playground, key, value)

            db.commit()
            db.refresh(db_charter_playground)

        return db_charter_playground

    @staticmethod
    def delete_charter_playground(
        charter_playground_public_id: str, charter_id: int, db: Session
    ) -> Optional[CharterPlaygroundModel]:
        db_charter_playground = CharterPlaygroundService.get_charter_playground(
            charter_playground_public_id, charter_id, db
        )

        if db_charter_playground:
            db.delete(db_charter_playground)
            db.commit()

        return db_charter_playground
