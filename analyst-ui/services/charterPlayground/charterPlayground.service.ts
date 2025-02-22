import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CharterPlaygroundUpdate,
  CharterPlaygroundResponse,
  CharterPlaygroundListResponse,
  CharterPlaygroundResponseSchema,
  CharterPlaygroundListResponseSchema,
  CharterPlaygroundQueryResultSchema,
  CharterPlaygroundQueryResult,
} from "./charterPlayground.schema";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useCurrentSession } from "@/lib/auth/session/react";

// Fetch list of playgrounds for a specific charter
export const useCharterPlaygroundListQuery = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useQuery<CharterPlaygroundListResponse, Error>({
    queryKey: ["playgrounds", organisationPublicId, charterId],
    queryFn: () => getCharterPlaygroundList({ organisationPublicId, charterId }, session!.accessToken!),
    enabled: !!session?.accessToken,
    gcTime: 0,
  });
};

// Fetch a single playground
export const useCharterPlaygroundQuery = ({
  organisationPublicId,
  charterId,
  playgroundPublicId,
}: {
  organisationPublicId: string;
  charterId: number;
  playgroundPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useQuery<CharterPlaygroundResponse, Error>({
    queryKey: ["playground", organisationPublicId, charterId, playgroundPublicId],
    queryFn: () => getCharterPlayground({ organisationPublicId, charterId, playgroundPublicId }, session!.accessToken!),
    enabled: !!session?.accessToken,
    gcTime: 0,
  });
};

// Create a new playground
export const useCreateCharterPlaygroundMutation = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async () => {
      return await createCharterPlayground({ organisationPublicId, charterId }, session!.accessToken!);
    },
  });
};

// Update a playground
export const useUpdateCharterPlaygroundMutation = ({
  organisationPublicId,
  charterId,
  playgroundPublicId,
}: {
  organisationPublicId: string;
  charterId: number;
  playgroundPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async ({ playground }: { playground: CharterPlaygroundUpdate }) => {
      return await updateCharterPlayground(
        { organisationPublicId, charterId, playgroundPublicId, playground },
        session!.accessToken!
      );
    },
  });
};

// Delete a playground
export const useDeleteCharterPlaygroundMutation = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (playgroundId: number) => {
      return await deleteCharterPlayground({ organisationPublicId, charterId, playgroundId }, session!.accessToken!);
    },
  });
};

// Execute a query
export const useExecuteCharterPlaygroundQueryMutation = ({
  organisationPublicId,
  charterId,
  playgroundPublicId,
}: {
  organisationPublicId: string;
  charterId: number;
  playgroundPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async ({ query, limit }: { query: string; limit?: number }) => {
      return await executeCharterPlaygroundQuery(
        { organisationPublicId, charterId, playgroundPublicId, query, limit },
        session!.accessToken!
      );
    },
  });
};

// Helper functions for API calls
export const getCharterPlaygroundList = async (
  { organisationPublicId, charterId }: { organisationPublicId: string; charterId: number },
  accessToken: string
): Promise<CharterPlaygroundListResponse> => {
  return await backendHttpClient
    .validate(CharterPlaygroundListResponseSchema)
    .get(`/organisation/${organisationPublicId}/charter/${charterId}/playground/list`, accessToken);
};

export const getCharterPlayground = async (
  {
    organisationPublicId,
    charterId,
    playgroundPublicId,
  }: {
    organisationPublicId: string;
    charterId: number;
    playgroundPublicId: string;
  },
  accessToken: string
): Promise<CharterPlaygroundResponse> => {
  return await backendHttpClient
    .validate(CharterPlaygroundResponseSchema)
    .get(`/organisation/${organisationPublicId}/charter/${charterId}/playground/${playgroundPublicId}`, accessToken);
};

export const createCharterPlayground = async (
  {
    organisationPublicId,
    charterId,
  }: {
    organisationPublicId: string;
    charterId: number;
  },
  accessToken: string
): Promise<CharterPlaygroundResponse> => {
  return await backendHttpClient
    .validate(CharterPlaygroundResponseSchema)
    .post(`/organisation/${organisationPublicId}/charter/${charterId}/playground`, {}, accessToken);
};

export const updateCharterPlayground = async (
  {
    organisationPublicId,
    charterId,
    playgroundPublicId,
    playground,
  }: {
    organisationPublicId: string;
    charterId: number;
    playgroundPublicId: string;
    playground: CharterPlaygroundUpdate;
  },
  accessToken: string
): Promise<CharterPlaygroundResponse> => {
  return await backendHttpClient
    .validate(CharterPlaygroundResponseSchema)
    .put(
      `/organisation/${organisationPublicId}/charter/${charterId}/playground/${playgroundPublicId}`,
      playground,
      accessToken
    );
};

export const deleteCharterPlayground = async (
  {
    organisationPublicId,
    charterId,
    playgroundId,
  }: {
    organisationPublicId: string;
    charterId: number;
    playgroundId: number;
  },
  accessToken: string
): Promise<void> => {
  await backendHttpClient.delete(
    `/organisation/${organisationPublicId}/charter/${charterId}/playground/${playgroundId}`,
    accessToken
  );
};

export const executeCharterPlaygroundQuery = async (
  {
    organisationPublicId,
    charterId,
    playgroundPublicId,
    query,
    limit,
  }: {
    organisationPublicId: string;
    charterId: number;
    playgroundPublicId: string;
    query: string;
    limit?: number;
  },
  accessToken: string
): Promise<CharterPlaygroundQueryResult> => {
  return await backendHttpClient
    .validate(CharterPlaygroundQueryResultSchema)
    .post(
      `/organisation/${organisationPublicId}/charter/${charterId}/playground/${playgroundPublicId}/execute`,
      { query, limit },
      accessToken
    );
};
