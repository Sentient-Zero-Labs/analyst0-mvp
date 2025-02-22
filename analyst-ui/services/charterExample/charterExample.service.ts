import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CharterExample,
  CharterExampleCreate,
  CharterExampleExlpainResponseSchema,
  CharterExampleExplainInput,
  CharterExampleExplainResponse,
  CharterExampleList,
  CharterExampleListSchema,
  CharterExampleSchema,
  CharterExampleUpdate,
} from "./charterExample.schema";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useCurrentSession } from "@/lib/auth/session/react";

const getBaseUrl = (organisationPublicId: string, charterId: number) =>
  `/organisation/${organisationPublicId}/charter/${charterId}/example`;

// Fetch list of data agent examples
export const useCharterExampleListQuery = ({
  charterId,
  organisationPublicId,
}: {
  charterId: number;
  organisationPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useQuery<CharterExampleList, Error>({
    queryKey: ["charterExamples", charterId],
    queryFn: () => getCharterExampleList({ organisationPublicId, charterId }, session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Fetch a single data agent example
export const useCharterExampleQuery = ({
  charterExampleId,
  charterId,
  organisationPublicId,
}: {
  charterExampleId: number;
  charterId: number;
  organisationPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useQuery<CharterExample, Error>({
    queryKey: ["charterExample", charterExampleId],
    queryFn: () => getCharterExample({ organisationPublicId, charterId, charterExampleId }, session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Create a new data agent example
export const useCreateCharterExampleMutation = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (charterExample: CharterExampleCreate) => {
      return await createCharterExample({ organisationPublicId, charterId, charterExample }, session!.accessToken!);
    },
  });
};

// Update an existing data agent example
export const useUpdateCharterExampleMutation = ({
  charterId,
  organisationPublicId,
}: {
  charterId: number;
  organisationPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async ({
      charterExampleId,
      charterExample,
    }: {
      charterExampleId: number;
      charterExample: CharterExampleUpdate;
    }) => {
      return await updateCharterExample(
        { organisationPublicId, charterId, charterExampleId, charterExample },
        session!.accessToken!
      );
    },
  });
};

// Delete a data agent example
export const useDeleteCharterExampleMutation = (organisationPublicId: string, charterId: number) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteCharterExample({ organisationPublicId, charterId, id }, session!.accessToken!);
    },
  });
};

// Explain a data agent example
export const useExplainCharterExampleMutation = ({
  charterId,
  organisationPublicId,
}: {
  charterId: number;
  organisationPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (charterExample: CharterExampleExplainInput) => {
      return await explainCharterExample({ organisationPublicId, charterId, charterExample }, session!.accessToken!);
    },
  });
};

// Helper functions for API calls
export const getCharterExampleList = async (
  { organisationPublicId, charterId }: { organisationPublicId: string; charterId: number },
  accessToken?: string
): Promise<CharterExampleList> => {
  if (!accessToken) throw new Error("Access token is required");

  return await backendHttpClient
    .validate(CharterExampleListSchema)
    .get<CharterExampleList>(`${getBaseUrl(organisationPublicId, charterId)}/list`, accessToken);
};

export const getCharterExample = async (
  {
    organisationPublicId,
    charterId,
    charterExampleId,
  }: { organisationPublicId: string; charterId: number; charterExampleId: number },
  accessToken?: string
): Promise<CharterExample> => {
  return await backendHttpClient
    .validate(CharterExampleSchema)
    .get<CharterExample>(`${getBaseUrl(organisationPublicId, charterId)}/${charterExampleId}`, accessToken);
};

export const createCharterExample = async (
  {
    organisationPublicId,
    charterId,
    charterExample,
  }: {
    organisationPublicId: string;
    charterId: number;
    charterExample: CharterExampleCreate;
  },
  accessToken: string
): Promise<CharterExample> => {
  return await backendHttpClient
    .validate(CharterExampleSchema)
    .post<CharterExample, CharterExampleCreate>(
      `${getBaseUrl(organisationPublicId, charterId)}`,
      charterExample,
      accessToken
    );
};

export const updateCharterExample = async (
  {
    charterExampleId,
    organisationPublicId,
    charterId,
    charterExample,
  }: {
    charterExample: CharterExampleUpdate;
    charterExampleId: number;
    charterId: number;
    organisationPublicId: string;
  },
  accessToken: string
): Promise<CharterExample> => {
  return await backendHttpClient
    .validate(CharterExampleSchema)
    .put<CharterExample, CharterExampleUpdate>(
      `${getBaseUrl(organisationPublicId, charterId)}/${charterExampleId}`,
      charterExample,
      accessToken
    );
};

export const deleteCharterExample = async (
  { organisationPublicId, charterId, id }: { organisationPublicId: string; charterId: number; id: number },
  accessToken: string
): Promise<void> => {
  await backendHttpClient.delete(`${getBaseUrl(organisationPublicId, charterId)}/${id}`, accessToken);
};

export const explainCharterExample = async (
  {
    organisationPublicId,
    charterId,
    charterExample,
  }: {
    charterExample: CharterExampleExplainInput;
    charterId: number;
    organisationPublicId: string;
  },
  accessToken: string
) => {
  return await backendHttpClient
    .validate(CharterExampleExlpainResponseSchema)
    .post<CharterExampleExplainResponse, CharterExampleExplainInput>(
      `${getBaseUrl(organisationPublicId, charterId)}/explain`,
      charterExample,
      accessToken
    );
};
