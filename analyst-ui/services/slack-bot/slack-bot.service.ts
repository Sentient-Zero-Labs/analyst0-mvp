import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useQuery } from "@tanstack/react-query";
import { SlackBotInstallUrlResponse, SlackBotInstallUrlResponseSchema } from "./slack-bot.schema";
import { useCurrentSession } from "@/lib/auth/session/react";

export const useSlackBotInstallUrlMutation = (organisationPublicId: string, isSlackBotEnabled: boolean | undefined) => {
  const { session } = useCurrentSession();

  return useQuery({
    queryKey: [organisationPublicId, "slack-bot-install-url"],
    queryFn: () => getSlackBotInstallUrl({ organisationPublicId: organisationPublicId }, session?.accessToken),
    enabled: !!organisationPublicId && isSlackBotEnabled == false && !!session?.accessToken,
  });
};

export const getSlackBotInstallUrl = async (
  { organisationPublicId }: { organisationPublicId: string },
  accessToken?: string
) => {
  return await backendHttpClient
    .validate(SlackBotInstallUrlResponseSchema)
    .get<SlackBotInstallUrlResponse>(`/slack-bot/install?organisation_public_id=${organisationPublicId}`, accessToken);
};
