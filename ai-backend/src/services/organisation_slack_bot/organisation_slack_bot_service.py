from slack_bolt.authorization.authorize_result import AuthorizeResult

from src.database import SessionLocal
from src.services.organisation_slack_bot.organisation_slack_bot_model import OrganisationSlackBotModel
from src.services.charter_chat.charter_chat_schema import Message
from src.utils.logger import setup_logger

logger = setup_logger()


def process_slack_messages(messages):
    processed_messages = []
    current_role = None
    current_content = []

    for msg in messages:
        if msg["type"] != "message":
            continue

        # Define blocks to skip
        SKIP_BLOCK_IDS = {"data_block", "processing_message"}

        # Skip messages with specific block IDs
        if "blocks" in msg:
            if any(block.get("block_id") in SKIP_BLOCK_IDS for block in msg["blocks"]):
                logger.debug(
                    f"Skipping message with block_id {[block.get('block_id') for block in msg['blocks']]}: {msg}"
                )
                continue

        new_role = "assistant" if "bot_id" in msg else "user"

        if new_role != current_role:
            if current_role:
                processed_messages.append(Message(role=current_role, content="\n\n".join(current_content)))
            current_role = new_role
            current_content = []

        content = msg["text"]
        # Remove mentions of the bot from user messages
        if new_role == "user":
            content = content.replace("@Super Analyst", "").strip()

        current_content.append(content)

    # Add the last message
    if current_role:
        processed_messages.append(Message(role=current_role, content="\n\n".join(current_content)))

    if processed_messages[-1].role == "assistant":
        processed_messages.pop()
    logger.debug(f"Processed messages: {processed_messages}")
    return processed_messages


async def authorize(enterprise_id: str, team_id: str, logger):
    try:
        with SessionLocal() as db:
            # Find the installation for this team_id
            slack_bot = db.query(OrganisationSlackBotModel).filter(OrganisationSlackBotModel.team_id == team_id).first()

            if not slack_bot:
                logger.error(f"No installation found for team ID: {team_id}")
                return None

            # Return the auth info for this workspace
            return AuthorizeResult(
                enterprise_id=slack_bot.enterprise_id,
                bot_token=slack_bot.bot_token,
                bot_user_id=slack_bot.bot_user_id,
                team_id=team_id,
            )
    except Exception as e:
        logger.error(f"Error in authorize: {str(e)}")
        return None


async def slack_say(say, message, thread_ts, block_id=None):
    if block_id:
        await say(
            blocks=[{"type": "section", "text": {"type": "mrkdwn", "text": message}, "block_id": block_id}],
            thread_ts=thread_ts,
        )
    else:
        await say(text=message, thread_ts=thread_ts)
