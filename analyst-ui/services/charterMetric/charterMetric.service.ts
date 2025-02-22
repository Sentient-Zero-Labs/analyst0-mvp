import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CharterMetric,
  CharterMetricCreate,
  CharterMetricDescribeInput,
  CharterMetricDescribeResponse,
  CharterMetricDescribeResponseSchema,
  CharterMetricList,
  CharterMetricListSchema,
  CharterMetricSchema,
  CharterMetricUpdate,
} from "./charterMetric.schema";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useCurrentSession } from "@/lib/auth/session/react";

// Fetch list of metrics for a specific charter
export const useCharterMetricListQuery = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) => {
  const { session } = useCurrentSession();

  return useQuery<CharterMetric[], Error>({
    queryKey: ["metrics", organisationPublicId, charterId],
    queryFn: () => getCharterMetricsList({ organisationPublicId, charterId }, session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Fetch a single metric for a specific charter
export const useCharterMetricQuery = ({
  organisationPublicId,
  charterId,
  charterMetricId,
}: {
  organisationPublicId: string;
  charterId: number;
  charterMetricId: number;
}) => {
  const { session } = useCurrentSession();

  return useQuery<CharterMetric, Error>({
    queryKey: ["metric", organisationPublicId, charterId, charterMetricId],
    queryFn: () => getCharterMetric({ organisationPublicId, charterId, charterMetricId }, session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Create a new metric
export const useCreateMetricMutation = (organisationPublicId: string, charterId: number) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (metric: CharterMetricCreate) => {
      return await createMetric({ organisationPublicId, charterId, metric }, session!.accessToken!);
    },
  });
};

// Update an existing metric
export const useUpdateMetricMutation = (organisationPublicId: string, charterId: number) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (metric: CharterMetricUpdate) => {
      return await updateMetric({ organisationPublicId, charterId, metric }, session!.accessToken!);
    },
  });
};

// Delete a metric
export const useDeleteMetricMutation = (organisationPublicId: string, charterId: number) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (charterMetricId: number) => {
      return await deleteMetric({ organisationPublicId, charterId, charterMetricId }, session!.accessToken!);
    },
  });
};

// Describe a metric
export const useDescribeMetricMutation = (organisationPublicId: string, charterId: number) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (charterMetricDescriptionInput: CharterMetricDescribeInput) => {
      return await describeCharterMetric(
        { organisationPublicId, charterId, charterMetricDescriptionInput },
        session!.accessToken!
      );
    },
  });
};

// Helper functions for API calls
export const getCharterMetricsList = async (
  { organisationPublicId, charterId }: { organisationPublicId: string; charterId: number },
  accessToken: string
): Promise<CharterMetricList> => {
  return await backendHttpClient
    .validate(CharterMetricListSchema)
    .get<CharterMetricList>(`/organisations/${organisationPublicId}/charters/${charterId}/metrics`, accessToken);
};

export const getCharterMetric = async (
  {
    organisationPublicId,
    charterId,
    charterMetricId,
  }: { organisationPublicId: string; charterId: number; charterMetricId: number },
  accessToken?: string
): Promise<CharterMetric> => {
  return await backendHttpClient
    .validate(CharterMetricSchema)
    .get<CharterMetric>(
      `/organisations/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}`,
      accessToken
    );
};

export const createMetric = async (
  {
    organisationPublicId,
    charterId,
    metric,
  }: { organisationPublicId: string; charterId: number; metric: CharterMetricCreate },
  accessToken: string
): Promise<CharterMetric> => {
  return await backendHttpClient
    .validate(CharterMetricSchema)
    .post<CharterMetric, CharterMetricCreate>(
      `/organisations/${organisationPublicId}/charters/${charterId}/metrics`,
      metric,
      accessToken
    );
};

export const updateMetric = async (
  {
    organisationPublicId,
    charterId,
    metric,
  }: { organisationPublicId: string; charterId: number; metric: CharterMetricUpdate },
  accessToken: string
): Promise<CharterMetric> => {
  return await backendHttpClient
    .validate(CharterMetricSchema)
    .put<CharterMetric, CharterMetricUpdate>(
      `/organisations/${organisationPublicId}/charters/${charterId}/metrics/${metric.id}`,
      metric,
      accessToken
    );
};

export const deleteMetric = async (
  {
    organisationPublicId,
    charterId,
    charterMetricId,
  }: { organisationPublicId: string; charterId: number; charterMetricId: number },
  accessToken: string
): Promise<void> => {
  await backendHttpClient.delete(
    `/organisations/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}`,
    accessToken
  );
};

export const describeCharterMetric = async (
  {
    charterMetricDescriptionInput,
    organisationPublicId,
    charterId,
  }: {
    charterMetricDescriptionInput: CharterMetricDescribeInput;
    charterId: number;
    organisationPublicId: string;
  },
  accessToken: string
): Promise<CharterMetricDescribeResponse> => {
  return await backendHttpClient
    .validate(CharterMetricDescribeResponseSchema)
    .post<CharterMetricDescribeResponse, CharterMetricDescribeInput>(
      `/organisations/${organisationPublicId}/charters/${charterId}/metrics/describe`,
      charterMetricDescriptionInput,
      accessToken
    );
};
