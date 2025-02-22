import { useMutation, useQuery } from "@tanstack/react-query";
import { CharterCreate, CharterUpdate, CharterResponse, CharterListResponse } from "./charter.schema";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useCurrentSession } from "@/lib/auth/session/react";

// Fetch list of charters
export const useChartersListQuery = ({ organisationPublicId }: { organisationPublicId?: string }) => {
  const { session } = useCurrentSession();

  return useQuery<CharterListResponse, Error>({
    queryKey: ["charters", organisationPublicId],
    queryFn: () => getCharterList({ organisationPublicId: organisationPublicId! }, session!.accessToken!),
    enabled: !!session?.accessToken && !!organisationPublicId,
  });
};

// Create a new charter
export const useCreateCharterMutation = ({ organisationPublicId }: { organisationPublicId: string }) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (charter: CharterCreate) => {
      return await createCharter({ charterCreate: charter, organisationPublicId }, session!.accessToken!);
    },
  });
};

// Get a single charter
export const useCharterQuery = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useQuery<CharterResponse, Error>({
    queryKey: ["charter", organisationPublicId, charterId],
    queryFn: () => getCharter({ organisationPublicId, charterId }, session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Update a charter
export const useUpdateCharterMutation = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (charterUpdate: CharterUpdate) => {
      return await updateCharter({ charterUpdate, organisationPublicId, charterId }, session!.accessToken!);
    },
  });
};

// Delete a charter
export const useDeleteCharterMutation = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async () => {
      return await deleteCharter({ organisationPublicId, charterId }, session!.accessToken!);
    },
  });
};

// Helper functions for API calls

export const getCharterList = async (
  { organisationPublicId }: { organisationPublicId: string },
  accessToken: string
): Promise<CharterListResponse> => {
  return await backendHttpClient.get<CharterListResponse>(
    `/organisations/${organisationPublicId}/charters`,
    accessToken
  );
};

export const createCharter = async (
  { charterCreate, organisationPublicId }: { charterCreate: CharterCreate; organisationPublicId: string },
  accessToken: string
): Promise<CharterResponse> => {
  return await backendHttpClient.post<CharterResponse>(
    `/organisations/${organisationPublicId}/charters`,
    charterCreate,
    accessToken
  );
};

export const getCharter = async (
  { organisationPublicId, charterId }: { organisationPublicId: string; charterId: number },
  accessToken?: string
): Promise<CharterResponse> => {
  return await backendHttpClient.get<CharterResponse>(
    `/organisations/${organisationPublicId}/charters/${charterId}`,
    accessToken
  );
};

export const updateCharter = async (
  {
    charterUpdate,
    organisationPublicId,
    charterId,
  }: { charterUpdate: CharterUpdate; organisationPublicId: string; charterId: number },
  accessToken: string
): Promise<CharterResponse> => {
  return await backendHttpClient.put<CharterResponse>(
    `/organisations/${organisationPublicId}/charters/${charterId}`,
    charterUpdate,
    accessToken
  );
};

export const deleteCharter = async (
  { organisationPublicId, charterId }: { organisationPublicId: string; charterId: number },
  accessToken: string
): Promise<CharterResponse> => {
  return await backendHttpClient.delete<CharterResponse>(
    `/organisations/${organisationPublicId}/charters/${charterId}`,
    accessToken
  );
};
