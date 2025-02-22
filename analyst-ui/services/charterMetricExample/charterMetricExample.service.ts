import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CharterMetricExample,
  CharterMetricExampleCreate,
  CharterMetricExampleExlpainResponseSchema,
  CharterMetricExampleExplainInput,
  CharterMetricExampleExplainResponse,
  CharterMetricExampleList,
  CharterMetricExampleListSchema,
  CharterMetricExampleSchema,
  CharterMetricExampleUpdate,
} from "./charterMetricExample.schema";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useCurrentSession } from "@/lib/auth/session/react";

// Fetch list of charterMetricExamples for a specific data agent metric
export const useCharterMetricExampleListQuery = ({
  charterMetricId,
  charterId,
  organisationPublicId,
}: {
  charterMetricId: number;
  charterId: number;
  organisationPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useQuery<CharterMetricExampleList, Error>({
    queryKey: ["charterMetricExamples", charterMetricId],
    queryFn: () =>
      getCharterMetricExampleList({ organisationPublicId, charterId, charterMetricId }, session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Fetch a single charterMetricExample for a specific data agent metric
export const useCharterMetricExampleQuery = ({
  charterMetricExampleId,
  charterMetricId,
  charterId,
  organisationPublicId,
}: {
  charterMetricExampleId: number;
  charterMetricId: number;
  charterId: number;
  organisationPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useQuery<CharterMetricExample, Error>({
    queryKey: ["charterMetricExample", charterMetricExampleId],
    queryFn: () =>
      getCharterMetricExample(
        { organisationPublicId, charterId, charterMetricId, charterMetricExampleId },
        session!.accessToken!
      ),
    enabled: !!session?.accessToken,
  });
};

// Create a new charterMetricExample
export const useCreateCharterMetricExampleMutation = ({
  organisationPublicId,
  charterId,
  charterMetricId,
}: {
  organisationPublicId: string;
  charterId: number;
  charterMetricId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (charterMetricExample: CharterMetricExampleCreate) => {
      return await createCharterMetricExample(
        { organisationPublicId, charterId, charterMetricId, charterMetricExample },
        session!.accessToken!
      );
    },
  });
};

// Update an existing charterMetricExample
export const useUpdateCharterMetricExampleMutation = ({
  charterMetricId,
  charterId,
  organisationPublicId,
}: {
  charterMetricId: number;
  charterId: number;
  organisationPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async ({
      charterMetricExampleId,
      charterMetricExample,
    }: {
      charterMetricExampleId: number;
      charterMetricExample: CharterMetricExampleUpdate;
    }) => {
      return await updateCharterMetricExample(
        { organisationPublicId, charterId, charterMetricId, charterMetricExampleId, charterMetricExample },
        session!.accessToken!
      );
    },
  });
};

// Delete a charterMetricExample
export const useDeleteCharterMetricExampleMutation = (
  organisationPublicId: string,
  charterId: number,
  charterMetricId: number
) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteCharterMetricExample(
        { organisationPublicId, charterId, charterMetricId, id },
        session!.accessToken!
      );
    },
  });
};

// Explain a charterMetricExample
export const useExplainCharterMetricExampleMutation = ({
  charterMetricId,
  charterId,
  organisationPublicId,
}: {
  charterMetricId: number;
  charterId: number;
  organisationPublicId: string;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (charterMetricExample: CharterMetricExampleExplainInput) => {
      return await explainCharterMetricExample(
        { organisationPublicId, charterId, charterMetricId, charterMetricExample },
        session!.accessToken!
      );
    },
  });
};

// Helper functions for API calls
export const getCharterMetricExampleList = async (
  {
    organisationPublicId,
    charterId,
    charterMetricId,
  }: { organisationPublicId: string; charterId: number; charterMetricId: number },
  accessToken?: string
): Promise<CharterMetricExampleList> => {
  if (!accessToken) throw new Error("Access token is required");

  return await backendHttpClient
    .validate(CharterMetricExampleListSchema)
    .get<CharterMetricExampleList>(
      `/organisations/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples`,
      accessToken
    );
};

export const getCharterMetricExample = async (
  {
    organisationPublicId,
    charterId,
    charterMetricId,
    charterMetricExampleId,
  }: { organisationPublicId: string; charterId: number; charterMetricId: number; charterMetricExampleId: number },
  accessToken?: string
): Promise<CharterMetricExample> => {
  return await backendHttpClient
    .validate(CharterMetricExampleSchema)
    .get<CharterMetricExample>(
      `/organisations/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples/${charterMetricExampleId}`,
      accessToken
    );
};

export const createCharterMetricExample = async (
  {
    organisationPublicId,
    charterId,
    charterMetricId,
    charterMetricExample,
  }: {
    organisationPublicId: string;
    charterId: number;
    charterMetricId: number;
    charterMetricExample: CharterMetricExampleCreate;
  },
  accessToken: string
): Promise<CharterMetricExample> => {
  return await backendHttpClient
    .validate(CharterMetricExampleSchema)
    .post<CharterMetricExample, CharterMetricExampleCreate>(
      `/organisations/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples`,
      charterMetricExample,
      accessToken
    );
};

export const updateCharterMetricExample = async (
  {
    charterMetricExampleId,
    organisationPublicId,
    charterId,
    charterMetricId,
    charterMetricExample,
  }: {
    charterMetricExample: CharterMetricExampleUpdate;
    charterMetricExampleId: number;
    charterMetricId: number;
    charterId: number;
    organisationPublicId: string;
  },
  accessToken: string
): Promise<CharterMetricExample> => {
  return await backendHttpClient
    .validate(CharterMetricExampleSchema)
    .put<CharterMetricExample, CharterMetricExampleUpdate>(
      `/organisations/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples/${charterMetricExampleId}`,
      charterMetricExample,
      accessToken
    );
};

export const deleteCharterMetricExample = async (
  {
    organisationPublicId,
    charterId,
    charterMetricId,
    id,
  }: { organisationPublicId: string; charterId: number; charterMetricId: number; id: number },
  accessToken: string
): Promise<void> => {
  await backendHttpClient.delete(
    `/organisations/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples/${id}`,
    accessToken
  );
};

export const explainCharterMetricExample = async (
  {
    organisationPublicId,
    charterId,
    charterMetricId,
    charterMetricExample,
  }: {
    charterMetricExample: CharterMetricExampleExplainInput;
    charterMetricId: number;
    charterId: number;
    organisationPublicId: string;
  },
  accessToken: string
): Promise<CharterMetricExampleExplainResponse> => {
  return await backendHttpClient
    .validate(CharterMetricExampleExlpainResponseSchema)
    .post<CharterMetricExampleExplainResponse, CharterMetricExampleExplainInput>(
      `/organisations/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples/explain`,
      charterMetricExample,
      accessToken
    );
};
