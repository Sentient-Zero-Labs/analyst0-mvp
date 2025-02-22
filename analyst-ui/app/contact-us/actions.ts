'use server'

export async function sendContactEmail(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const company = formData.get('company') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const message = formData.get('message') as string;

    // Prepare a detailed Slack message
    const slackMessage = {
      text: "🚀 New Enterprise Contact Request",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*New Enterprise Contact Request*"
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Contact Name:*\n${name}`
            },
            {
              type: "mrkdwn",
              text: `*Company:*\n${company}`
            },
            {
              type: "mrkdwn",
              text: `*Email:*\n${email}`
            },
            {
              type: "mrkdwn",
              text: `*Job Title:*\n${jobTitle}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n>${message}`
          }
        }
      ]
    };

    const response = await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error('Failed to send to Slack');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }
} 