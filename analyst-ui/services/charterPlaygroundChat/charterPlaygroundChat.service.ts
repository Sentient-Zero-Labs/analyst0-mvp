import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { PlaygroundChatInput } from "./charterPlaygroundChat.schema";
import { useMutation } from "@tanstack/react-query";
import { useCurrentSession } from "@/lib/auth/session/react";

export const usePlaygroundChatMutation = ({
  playgroundPublicId,
  organisationPublicId,
  charterId,
}: {
  playgroundPublicId: string;
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async ({ playgroundChatInput }: { playgroundChatInput: PlaygroundChatInput }) => {
      return await playgroundChat({
        playgroundPublicId,
        playgroundChatInput,
        organisationPublicId,
        charterId,
        accessToken: session!.accessToken!,
      });
    },
  });
};

export const playgroundChat = async ({
  playgroundPublicId,
  playgroundChatInput,
  organisationPublicId,
  charterId,
  accessToken,
}: {
  playgroundPublicId: string;
  playgroundChatInput: PlaygroundChatInput;
  organisationPublicId: string;
  charterId: number;
  accessToken: string;
}): Promise<PlaygroundChatInput> => {
  return await backendHttpClient.post<PlaygroundChatInput>(
    `/organisation/${organisationPublicId}/charter/${charterId}/playground/${playgroundPublicId}/chat`,
    playgroundChatInput,
    accessToken
  );
};
