import time

from tabulate import tabulate

from src.services.organisation_slack_bot.organisation_slack_bot_service import (
    process_slack_messages,
    slack_say,
)
from src.utils.logger import logger


class Demo:
    @staticmethod
    async def handle_slack_message(event, say, client):
        logger.info("Event received")
        thread_ts = event.get("thread_ts", event["ts"])
        channel_id = event["channel"]
        team_id = event["team"]
        logger.debug(f"Thread TS: {thread_ts}, Channel ID: {channel_id}, Team ID: {team_id}")

        time.sleep(0.2)
        await slack_say(say, message="🧐 Analysing your question...", thread_ts=thread_ts, block_id="analysing_message")

        time.sleep(0.3)
        await slack_say(say, message="👨🏻‍💻 Forming SQL Query:", thread_ts=thread_ts, block_id="analysing_message")

        try:
            logger.debug(f"Thread TS: {thread_ts}")
            thread_response = await client.conversations_replies(channel=channel_id, ts=thread_ts)
            logger.debug(f"Thread response: {thread_response}")
            messages = process_slack_messages(thread_response["messages"])

            last_message = messages[-1]

            time.sleep(0.7)

            if "failed" in last_message.content.lower() or "failure" in last_message.content.lower():
                query, explanation, table = Demo.get_verification_email_failures_data()
            elif "started" in last_message.content.lower():
                query, explanation, table = Demo.get_signup_started_data()
            elif "signups" in last_message.content.lower():
                query, explanation, table = Demo.get_signup_data()

            await slack_say(say, message=f"\n```{query}```", thread_ts=thread_ts, block_id="query_block")
            time.sleep(0.4)

            await slack_say(say, message=explanation, thread_ts=thread_ts, block_id="explanation_block")
            time.sleep(0.5)

            await slack_say(say, message="📊 Fetching data...", thread_ts=thread_ts, block_id="fetching_message")
            time.sleep(0.5)

            await slack_say(say, message=table, thread_ts=thread_ts, block_id="data_block")

        except Exception as e:
            logger.error(f"Error in handle_slack_message: {str(e)}")
            await slack_say(say, message="❌ An error occurred while processing your request.", thread_ts=thread_ts)

    @staticmethod
    def get_signup_data():
        query = """
SELECT
    DATE_TRUNC('week', created_date) AS week_start,
    COUNT(*) AS signups
FROM
    org_user
WHERE
    created_date >= NOW() - INTERVAL '1 month'
GROUP BY
    week_start
ORDER BY
    week_start DESC;
"""

        explanation = """
The query shows weekly signups from the past 1 month, grouped by week.
                """
        rows = [
            ["week_start", "total_signups"],
            ["2024-11-04T00:00:00Z", 169],
            ["2024-10-28T00:00:00Z", 601],
            ["2024-10-21T00:00:00Z", 669],
            ["2024-10-14T00:00:00Z", 504],
        ]

        headers = rows[0]
        rows = rows[1:]

        table = tabulate(
            rows,
            headers=headers,
            maxcolwidths=30,
            colalign=("left",) * len(headers),
        )

        table = f"""```{table}```"""

        return query, explanation, table

    def get_signup_started_data():
        query = """
WITH weekly_signups AS (
    SELECT
        DATE_TRUNC('week', created_at) as week_start,
        COUNT(*) as total_signup_started,
        COUNT(DISTINCT email) as unique_users_signup_started
    FROM signup_events
    WHERE 
        event_type = 'SIGNUP_STARTED'
        AND created_at >= CURRENT_DATE - INTERVAL '1 month'
    GROUP BY DATE_TRUNC('week', created_at)
)
SELECT
    week_start,
    total_signups,
    unique_users
FROM weekly_signups
ORDER BY week_start DESC;
"""

        explanation = """
This query groups signup events by week, counting total and unique signups over the past 1 month, ordered by most recent week first.
"""
        rows = [
            ["week_start", "total_signup_started", "unique_users_signup_started"],
            ["2024-11-04T00:00:00Z", 549, 502],
            ["2024-10-28T00:00:00Z", 622, 601],
            ["2024-10-21T00:00:00Z", 689, 669],
            ["2024-10-14T00:00:00Z", 513, 504],
        ]

        headers = rows[0]
        rows = rows[1:]

        table = tabulate(
            rows,
            headers=headers,
            maxcolwidths=30,
            colalign=("left",) * len(headers),
        )

        table = f"""```{table}```"""

        return query, explanation, table

    def get_verification_email_failures_data():
        query = """
WITH weekly_email_stats AS (
   SELECT
       DATE_TRUNC('week', created_at) as week_start,
       COUNT(*) as total_attempts,
       SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_attempts
   FROM email_send_events
   WHERE
       email_type = 'VERIFICATION'
       AND created_at >= CURRENT_DATE - INTERVAL '1 month'
   GROUP BY DATE_TRUNC('week', created_at)
)
SELECT
   week_start,
   total_attempts,
   failed_attempts,
   ROUND((failed_attempts::numeric / total_attempts::numeric * 100), 2) as failure_rate
FROM weekly_email_stats
ORDER BY week_start DESC;
"""

        explanation = """
This query shows weekly verification email attempts, failures, and failure rates over 1 month."""

        rows = [
            ["week_start", "total_attempts", "failed_attempts", "failure_rate"],
            ["2024-11-04T00:00:00Z", 549, 380, 69.22],
            ["2024-10-28T00:00:00Z", 622, 21, 3.38],
            ["2024-10-21T00:00:00Z", 689, 20, 2.9],
            ["2024-10-14T00:00:00Z", 513, 9, 1.75],
        ]

        headers = rows[0]
        rows = rows[1:]

        table = tabulate(
            rows,
            headers=headers,
            maxcolwidths=30,
            colalign=("left",) * len(headers),
        )

        table = f"""```{table}```"""

        return query, explanation, table
