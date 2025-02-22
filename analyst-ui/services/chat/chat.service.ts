import { useMutation } from "@tanstack/react-query";
import { Messages, MessagesSchema } from "./chat.schema";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useCurrentSession } from "@/lib/auth/session/react";

export const useChatMutation = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async ({
      messages,
      selectedEntityIds,
      selectedCharterMetricIds,
    }: {
      messages: Messages;
      selectedEntityIds: number[];
      selectedCharterMetricIds: number[];
    }) => {
      return await chat(
        { organisationPublicId, charterId, messages, selectedEntityIds, selectedCharterMetricIds },
        session!.accessToken!
      );
    },
  });
};

// Helper functions for API calls
export const chat = async (
  {
    organisationPublicId,
    charterId,
    messages,
    selectedEntityIds,
    selectedCharterMetricIds,
  }: {
    organisationPublicId: string;
    charterId: number;
    messages: Messages;
    selectedEntityIds: number[];
    selectedCharterMetricIds: number[];
  },
  accessToken: string
): Promise<Messages> => {
  return await backendHttpClient.validate(MessagesSchema).post(
    `/organisations/${organisationPublicId}/charters/${charterId}/chat`,
    {
      messages,
      context: {
        data_entity_ids: selectedEntityIds,
        charter_metric_ids: selectedCharterMetricIds,
      },
    },
    accessToken
  );
};
