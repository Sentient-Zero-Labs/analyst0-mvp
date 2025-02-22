from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from slack_bolt.adapter.fastapi.async_handler import AsyncSlackRequestHandler
from slack_bolt.app.async_app import AsyncApp
from slack_sdk import WebClient
from slack_sdk.oauth import AuthorizeUrlGenerator
from sqlalchemy import select
from sqlalchemy.orm import Session
from tabulate import tabulate

from src.database import get_async_db, get_db
from src.internal_services.data_source_connector.data_source_connector_factory import DataSourceConnectorFactory
from src.internal_services.demo.demo import Demo
from src.middleware.wrap_response import DataResponse
from src.services.charter.charter_model import CharterModel
from src.services.charter_chat.charter_chat_controller import handle_chat_question
from src.services.charter_chat.charter_chat_schema import ChatInput, ChatInputContext, Message
from src.services.charter_slack_channel.charter_slack_channel_model import CharterSlackChannelModel
from src.services.data_source.data_source_model import DataSourceModel
from src.services.organisation.organisation_dependency import get_admin_organisation
from src.services.organisation.organisation_model import OrganisationModel
from src.services.organisation_slack_bot.organisation_slack_bot_model import OrganisationSlackBotModel
from src.services.organisation_slack_bot.organisation_slack_bot_service import (
    authorize,
    process_slack_messages,
    slack_say,
)
from src.settings import settings
from src.utils.logger import logger
from src.utils.security import decode_encrypted, encode_encrypted

authorize_url_generator = AuthorizeUrlGenerator(
    client_id=settings.SLACK_CLIENT_ID,
    redirect_uri=f"{settings.CURRENT_SERVER_URL}/v1/slack-bot/oauth_redirect",
    scopes=[
        "chat:write",
        "channels:history",
        "app_mentions:read",
        "groups:history",
        "im:history",
        "mpim:history",
        "im:read",
    ],
)


# Initialize Slack app App
slack_app = AsyncApp(signing_secret=settings.SLACK_SIGNING_SECRET, authorize=authorize)

client = WebClient()

handler = AsyncSlackRequestHandler(slack_app)

router = APIRouter(prefix="/slack-bot")


# Event handler for demo bot mentions.
# Need to comment out the other event handler for app_mention
@slack_app.event("app_mention")
async def handle_demo_mention(event, say, client: WebClient):
    return await Demo.handle_slack_message(event, say, client)


# Event handler for bot mentions
# @slack_app.event("app_mention")
async def handle_mention(event, say, client):
    logger.info("Event received")
    thread_ts = event.get("thread_ts", event["ts"])
    channel_id = event["channel"]
    team_id = event["team"]
    logger.debug(f"Thread TS: {thread_ts}, Channel ID: {channel_id}, Team ID: {team_id}")

    await slack_say(say, message="🔄 Processing your request...", thread_ts=thread_ts, block_id="processing_message")

    # Get all messages in the thread
    try:
        logger.debug(f"Thread TS: {thread_ts}")
        thread_response = await client.conversations_replies(channel=channel_id, ts=thread_ts)
        logger.debug(f"Thread response: {thread_response}")
        messages = process_slack_messages(thread_response["messages"])

        chat_input = ChatInput(messages=messages, context=ChatInputContext())

        async for async_db in get_async_db():
            # Combined query to get all necessary models in one go
            combined_query = (
                select(
                    OrganisationSlackBotModel,
                    OrganisationModel,
                    CharterSlackChannelModel,
                    CharterModel,
                    DataSourceModel,
                )
                .join(
                    OrganisationModel,
                    OrganisationSlackBotModel.organisation_id == OrganisationModel.id,
                )
                .join(
                    CharterSlackChannelModel,
                    CharterSlackChannelModel.slack_channel_id == channel_id,
                )
                .join(
                    CharterModel,
                    CharterModel.id == CharterSlackChannelModel.charter_id,
                )
                .join(
                    DataSourceModel,
                    DataSourceModel.id == CharterModel.data_source_id,
                )
                .filter(OrganisationSlackBotModel.team_id == team_id)
            )

            result = (await async_db.execute(combined_query)).first()

            if not result:
                raise HTTPException(status_code=404, detail="Charter not found")

            (
                organisation_slack_bot,
                organisation_model,
                charter_slack_channel_model,
                charter_model,
                data_source_model,
            ) = result

            data_source_connector = DataSourceConnectorFactory.get_data_source_connector(data_source_model)

            resp = await handle_chat_question(
                chat_input, charter=charter_model, async_db=async_db, data_source_connector=data_source_connector
            )

        message: Message = resp.data[-1]

        if message.content is not None:
            await slack_say(say, message=message.content, thread_ts=thread_ts, block_id="response_content")
        else:
            data_list = message.data_call.data

            cleaned_data = []
            for item in data_list:
                cleaned_item = {
                    k: v.replace("\n", " ") if isinstance(v, str) else "N/A" if v is None else v
                    for k, v in item.items()
                }
                cleaned_data.append(cleaned_item)

            headers = list(cleaned_data[0].keys())
            rows = [list(item.values()) for item in cleaned_data]

            table = tabulate(
                rows,
                missingval="N/A",
                headers=headers,
                maxcolwidths=30,
                tablefmt="grid",
                colalign=("left",) * len(headers),
            )

            query = message.data_call.query
            explanation = message.data_call.explanation

            await slack_say(say, message=f"*Query:*\n```{query}```", thread_ts=thread_ts, block_id="query_block")
            await slack_say(
                say, message=f"*Explanation:*\n{explanation}", thread_ts=thread_ts, block_id="explanation_block"
            )
            await slack_say(say, message=f"*Data:*\n{table}", thread_ts=thread_ts, block_id="data_block")

    except Exception as e:
        logger.error(f"Error in handle_mention: {str(e)}")
        message = "An error occurred while processing your request. Please try again later."
        # Check if Charter not found error
        if "Charter not found" in str(e):
            message = "Seems like this channel has not been added to any charter. Please add this channel to a charter and try again."

        await say(text=message, thread_ts=thread_ts)


@router.get("/install")
def install(db_organisation: OrganisationModel = Depends(get_admin_organisation)):
    # Encrypt the state with the charter id and organisation public id. This state will be decoded in the oauth_redirect endpoint
    state = encode_encrypted({"organisation_public_id": db_organisation.public_id})

    # Generate authorization URL
    auth_url = authorize_url_generator.generate(state=state)

    return DataResponse(data={"auth_url": auth_url})


@router.get("/oauth_redirect")
def oauth_redirect(code: str, state: str, db: Session = Depends(get_db)):
    try:
        logger.info("OAuth redirect received")
        logger.debug(f"Code: {code}, State: {state}")

        state = decode_encrypted(state)
        organisation = (
            db.query(OrganisationModel).filter(OrganisationModel.public_id == state["organisation_public_id"]).first()
        )

        response = client.oauth_v2_access(
            client_id=settings.SLACK_CLIENT_ID, client_secret=settings.SLACK_CLIENT_SECRET, code=code
        )

        logger.debug(f"Response: {response}")

        bot_token = response["access_token"]
        team_id = response["team"]["id"] if response["team"] else None
        enterprise_id = response["enterprise"]["id"] if response["enterprise"] else None
        logger.debug(f"Team ID: {team_id}, Enterprise ID: {enterprise_id}")

        # Check if bot already exists
        existing_bot = (
            db.query(OrganisationSlackBotModel)
            .filter(
                OrganisationSlackBotModel.organisation_id == organisation.id,
                OrganisationSlackBotModel.team_id == team_id,
            )
            .first()
        )

        if existing_bot:
            # Update existing bot
            existing_bot.bot_token = bot_token
            existing_bot.bot_user_id = response["bot_user_id"]
            existing_bot.enterprise_id = enterprise_id
            logger.info("Updating existing Slack bot")
        else:
            # Create new bot
            slack_bot = OrganisationSlackBotModel(
                organisation_id=organisation.id,
                team_id=team_id,
                bot_user_id=response["bot_user_id"],
                bot_token=bot_token,
                enterprise_id=enterprise_id,
            )
            db.add(slack_bot)
            logger.info("Creating new Slack bot")

        db.commit()

        # Redirect to your frontend URL with a success parameter
        redirect_url = f"{settings.FRONTEND_URL}/slack/success"  # Define this in your settings
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        logger.error(f"Error in oauth_redirect: {str(e)}")
        db.rollback()
        # Redirect to error page in case of failure
        error_url = f"{settings.FRONTEND_URL}/slack/error?message={str(e)}"
        return RedirectResponse(url=error_url)


# FastAPI endpoints
@router.post("/events")
async def chat_endpoint(request: Request):
    resp = await handler.handle(request, addition_context_properties={"data": "NOICE"})
    return resp
