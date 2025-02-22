import { useQuery } from "@tanstack/react-query";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useCurrentSession } from "@/lib/auth/session/react";
import {
  CharterPlaygroundListResponse,
  CharterPlaygroundListResponseSchema,
} from "../charterPlayground/charterPlayground.schema";

// Fetch list of playgrounds for a specific charter
export const usePlaygroundListQuery = ({ organisationPublicId }: { organisationPublicId: string }) => {
  const { session } = useCurrentSession();

  return useQuery<CharterPlaygroundListResponse, Error>({
    queryKey: ["playgrounds", organisationPublicId],
    queryFn: () => getUserPlaygroundList({ organisationPublicId }, session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Helper functions for API calls
export const getUserPlaygroundList = async (
  { organisationPublicId }: { organisationPublicId: string },
  accessToken: string
): Promise<CharterPlaygroundListResponse> => {
  return await backendHttpClient
    .validate(CharterPlaygroundListResponseSchema)
    .get(`/organisation/${organisationPublicId}/user/playground/list`, accessToken);
};
