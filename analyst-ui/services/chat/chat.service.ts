import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatResponse, ChatResponseSchema, Conversation, ConversationsList, ConversationsListSchema, Messages, MessagesSchema } from "./chat.schema";
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messages,
      selectedEntityIds,
      selectedCharterMetricIds,
      conversationId,
    }: {
      messages: Messages;
      selectedEntityIds: number[];
      selectedCharterMetricIds: number[];
      conversationId?: string;
    }) => {
      return await chat(
        { organisationPublicId, charterId, messages, selectedEntityIds, selectedCharterMetricIds, conversationId },
        session!.accessToken!
      );
    },
    onSuccess: () => {
      // Invalidate conversations list query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["conversations", organisationPublicId, charterId] });
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
    conversationId,
  }: {
    organisationPublicId: string;
    charterId: number;
    messages: Messages;
    selectedEntityIds: number[];
    selectedCharterMetricIds: number[];
    conversationId?: string;
  },
  accessToken: string
): Promise<ChatResponse> => {
  return await backendHttpClient.validate(ChatResponseSchema).post(
    `/organisations/${organisationPublicId}/charters/${charterId}/chat`,
    {
      messages,
      context: {
        data_entity_ids: selectedEntityIds,
        charter_metric_ids: selectedCharterMetricIds,
      },
      conversation_id: conversationId,
    },
    accessToken
  );
};

// Fetch list of conversations
export const useConversationsListQuery = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useQuery<ConversationsList, Error>({
    queryKey: ["conversations", organisationPublicId, charterId],
    queryFn: () => getConversationsList({ organisationPublicId, charterId }, session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Fetch a specific conversation by ID
export const useConversationQuery = ({
  organisationPublicId,
  charterId,
  conversationId,
  enabled = true,
}: {
  organisationPublicId: string;
  charterId: number;
  conversationId: string;
  enabled?: boolean;
}) => {
  const { session } = useCurrentSession();

  return useQuery<Messages, Error>({
    queryKey: ["conversation", organisationPublicId, charterId, conversationId],
    queryFn: () => getConversation({ organisationPublicId, charterId, conversationId }, session!.accessToken!),
    enabled: !!session?.accessToken && !!conversationId && enabled,
  });
};

// Delete a conversation
export const useDeleteConversationMutation = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId }: { conversationId: string }) => {
      return await deleteConversation(
        { organisationPublicId, charterId, conversationId },
        session!.accessToken!
      );
    },
    onSuccess: () => {
      // Invalidate conversations list query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["conversations", organisationPublicId, charterId] });
    },
  });
};

// Helper functions for API calls
export const getConversationsList = async (
  { organisationPublicId, charterId }: { organisationPublicId: string; charterId: number },
  accessToken: string
): Promise<ConversationsList> => {
  return await backendHttpClient.validate(ConversationsListSchema).get(
    `/organisations/${organisationPublicId}/charters/${charterId}/chat/conversations`,
    accessToken
  );
};

export const getConversation = async (
  {
    organisationPublicId,
    charterId,
    conversationId,
  }: {
    organisationPublicId: string;
    charterId: number;
    conversationId: string;
  },
  accessToken: string
): Promise<Messages> => {
  const response = await backendHttpClient.get(
    `/organisations/${organisationPublicId}/charters/${charterId}/chat/conversations/${conversationId}`,
    accessToken
  );
  // The response is wrapped in a data property by the backend
  return (response as any).data;
};

export const deleteConversation = async (
  {
    organisationPublicId,
    charterId,
    conversationId,
  }: {
    organisationPublicId: string;
    charterId: number;
    conversationId: string;
  },
  accessToken: string
): Promise<void> => {
  return await backendHttpClient.delete(
    `/organisations/${organisationPublicId}/charters/${charterId}/chat/conversations/${conversationId}`,
    accessToken
  );
};
