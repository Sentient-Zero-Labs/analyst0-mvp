import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.charter_chat.charter_chat_model import CharterChatConversationModel
from src.services.charter_chat.charter_chat_schema import Message


class CharterChatConversationService:
    @staticmethod
    async def create_conversation(charter_id: int, messages: List[Message], async_db: AsyncSession) -> str:
        """Create a new conversation and return its ID.

        Args:
            charter_id: The ID of the charter
            messages: List of messages in the conversation
            async_db: Async database session

        Returns:
            str: The newly created conversation ID
        """
        conversation_id = str(uuid.uuid4())
        conversation = CharterChatConversationModel(
            conversation_id=conversation_id,
            charter_id=charter_id,
            messages=[message.model_dump() for message in messages],
        )
        async_db.add(conversation)
        await async_db.commit()
        return conversation_id

    @staticmethod
    async def update_conversation(conversation_id: str, messages: List[Message], async_db: AsyncSession) -> bool:
        """Update an existing conversation with new messages.

        Args:
            conversation_id: The ID of the conversation to update
            messages: New list of messages
            async_db: Async database session

        Returns:
            bool: True if conversation was updated, False if not found
        """
        stmt = select(CharterChatConversationModel).where(
            CharterChatConversationModel.conversation_id == conversation_id
        )
        result = await async_db.execute(stmt)
        conversation = result.scalar_one_or_none()

        if conversation:
            conversation.messages = [message.model_dump() for message in messages]
            await async_db.commit()
            return True
        return False

    @staticmethod
    async def get_conversation(conversation_id: str, async_db: AsyncSession) -> Optional[CharterChatConversationModel]:
        """Get a conversation by its ID.

        Args:
            conversation_id: The ID of the conversation to retrieve
            async_db: Async database session

        Returns:
            Optional[CharterChatConversationModel]: The conversation if found, None otherwise
        """
        stmt = select(CharterChatConversationModel).where(
            CharterChatConversationModel.conversation_id == conversation_id
        )
        result = await async_db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_conversations_by_charter(
        charter_id: int, async_db: AsyncSession
    ) -> List[CharterChatConversationModel]:
        """Get all conversations for a charter.

        Args:
            charter_id: The ID of the charter
            async_db: Async database session

        Returns:
            List[CharterChatConversationModel]: List of conversations
        """
        stmt = (
            select(CharterChatConversationModel)
            .where(CharterChatConversationModel.charter_id == charter_id)
            .order_by(CharterChatConversationModel.updated_at.desc())
        )
        result = await async_db.execute(stmt)
        return result.scalars().all()
