"use client";

import { Button } from "@/components/ui/button";
// import { BOT_NAME } from "@/lib/constants/common.constants";
import { useSelectedOrganisation } from "@/lib/store/global-store";

import { useChartersListQuery } from "@/services/charter/charter.service";
import { useSlackBotInstallUrlMutation } from "@/services/slack-bot/slack-bot.service";

import Link from "next/link";
import PageLoader from "../loading";

export default function ChatPage({ organisationPublicId }: { organisationPublicId: string }) {
  const { selectedOrganisation: selectedOrg } = useSelectedOrganisation();

  const { data: charters, isLoading } = useChartersListQuery({ organisationPublicId: selectedOrg?.public_id });

  const { isLoading: isSlackBotInstallUrlLoading } = useSlackBotInstallUrlMutation(
    organisationPublicId,
    selectedOrg?.is_slack_bot_enabled
  );
  // const { data: slackBotInstallUrl, isLoading: isSlackBotInstallUrlLoading } = useSlackBotInstallUrlMutation(
  //   organisationPublicId,
  //   selectedOrg?.is_slack_bot_enabled
  // );

  if (isLoading || isSlackBotInstallUrlLoading) return <PageLoader />;

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4 justify-center mt-10">
      <div className="w-full flex flex-col items-center gap-4">
        <div>
          <h3 className="mb-1 text-2xl text-center">Hi, I can help you find answers related to your data.</h3>
          <div className="text-sm text-center">You can ask me questions about your data at the charter level.</div>
        </div>

        {charters && charters?.length > 0 ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-4 justify-center flex-wrap px-20">
              {charters?.map((charter) => (
                <div key={charter.id} className="border rounded-lg w-48 h-40 p-3 flex flex-col gap-2 justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Charter</span>
                    <span className="font-semibold break-all">{charter.name}</span>
                  </div>
                  <Link href={`/organisation/${organisationPublicId}/charters/${charter.id}/chat`}>
                    <Button size={"sm"} className="w-full">
                      Chat
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            {/* Slack Button */}

            <span className="text-sm text-center">
              <span className="font-semibold">Slack chat</span> is coming soon. Meanwhile, you can chat with me here.
            </span>

            {/* {!selectedOrg?.is_slack_bot_enabled ? (
              <div className="flex flex-col items-center gap-1">
                <span>You can also chat with me on Slack. Integrate me to your workspace.</span>
                <Button>
                  <a className="flex flex-row items-center" href={slackBotInstallUrl?.auth_url} target="_blank">
                    <div className="size-5 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="slack-icon" viewBox="0 0 122.8 122.8">
                        <path
                          d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
                          fill="#e01e5a"
                        />
                        <path
                          d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
                          fill="#36c5f0"
                        />
                        <path
                          d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
                          fill="#2eb67d"
                        />
                        <path
                          d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
                          fill="#ecb22e"
                        />
                      </svg>
                    </div>
                    <span>Add {BOT_NAME} to Slack</span>
                  </a>
                </Button>
              </div>
            ) : null} */}
          </div>
        ) : selectedOrg?.data_source_count === 0 ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-center text-destructive">
              You don&apos;t have any data sources yet. Add a data source and create a charter to start chatting with
              your data.
            </span>
            <Link href={`/organisation/${selectedOrg?.public_id}/data-sources/create`}>
              <Button>Add Data Source</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-center text-destructive">
              You don&apos;t have any charters yet. Create a new agent to start chatting with your data.
            </span>
            <Link href={`/organisation/${selectedOrg?.public_id}/charters/create`}>
              <Button>Create New Agent</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
