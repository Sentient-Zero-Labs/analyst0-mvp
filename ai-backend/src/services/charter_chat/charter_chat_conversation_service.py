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

        # Generate title from the first user message
        title = None
        first_user_message = next((m for m in messages if m.role == "user"), None)
        if first_user_message and first_user_message.content:
            content = first_user_message.content
            title = content[:50] + ("..." if len(content) > 50 else "")

        conversation = CharterChatConversationModel(
            conversation_id=conversation_id,
            charter_id=charter_id,
            title=title,
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

    @staticmethod
    async def update_conversation_title(conversation_id: str, title: str, async_db: AsyncSession) -> bool:
        """Update the title of a conversation.

        Args:
            conversation_id: The ID of the conversation to update
            title: The new title
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
            conversation.title = title
            await async_db.commit()
            return True
        return False

    @staticmethod
    async def generate_and_update_title(conversation_id: str, async_db: AsyncSession) -> bool:
        """Generate a title for a conversation based on the first user message.

        Args:
            conversation_id: The ID of the conversation
            async_db: Async database session

        Returns:
            bool: True if title was updated, False if not
        """
        conversation = await CharterChatConversationService.get_conversation(conversation_id, async_db)
        if not conversation or not conversation.messages:
            return False

        # Find the first user message
        first_user_message = next((m for m in conversation.messages if m.get("role") == "user"), None)
        if not first_user_message or not first_user_message.get("content"):
            return False

        # Generate title (truncate to 50 chars)
        content = first_user_message.get("content", "")
        title = content[:50] + ("..." if len(content) > 50 else "")

        # Update the conversation
        conversation.title = title
        await async_db.commit()
        return True

    @staticmethod
    async def delete_conversation(conversation_id: str, async_db: AsyncSession) -> bool:
        """Delete a conversation by its ID.

        Args:
            conversation_id: The ID of the conversation to delete
            async_db: Async database session

        Returns:
            bool: True if conversation was deleted, False if not found
        """
        conversation = await CharterChatConversationService.get_conversation(conversation_id, async_db)
        if not conversation:
            return False

        await async_db.delete(conversation)
        await async_db.commit()
        return True
