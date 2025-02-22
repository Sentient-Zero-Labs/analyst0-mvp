import { useMutation, useQuery } from "@tanstack/react-query";
import { DataSource, DataSourceCreate, DataSourceSchema, DataSourceUpdate } from "./dataSource.schema";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useCurrentSession } from "@/lib/auth/session/react";

// Fetch list of data sources
export const useDataSourcesQuery = ({ organisationPublicId }: { organisationPublicId: string }) => {
  const { session } = useCurrentSession();

  return useQuery<DataSource[], Error>({
    queryKey: ["data_sources", organisationPublicId],
    queryFn: () => getDataSources({ organisationPublicId }, session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Fetch a single data source
export const useDataSourceQuery = ({
  organisationPublicId,
  dataSourceId,
}: {
  organisationPublicId: string;
  dataSourceId: number;
}) => {
  const { session } = useCurrentSession();

  return useQuery<DataSource, Error>({
    queryKey: ["data_source", organisationPublicId, dataSourceId],
    queryFn: () => getDataSource({ organisationPublicId, dataSourceId }, session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Create a new data source
export const useCreateDataSourceMutation = ({ organisationPublicId }: { organisationPublicId: string }) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (dataSourceCreate: DataSourceCreate) => {
      return await createDataSource({ dataSourceCreate, organisationPublicId }, session!.accessToken!);
    },
  });
};

// Update a data source
export const useUpdateDataSourceMutation = ({
  organisationPublicId,
  dataSourceId,
}: {
  organisationPublicId: string;
  dataSourceId?: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (dataSourceUpdate: DataSourceUpdate) => {
      return await updateDataSource({ dataSourceUpdate, organisationPublicId, dataSourceId }, session!.accessToken!);
    },
  });
};

// Helper functions for API calls
export const getDataSource = async (
  { organisationPublicId, dataSourceId }: { organisationPublicId: string; dataSourceId: number },
  accessToken: string
): Promise<DataSource> => {
  return await backendHttpClient
    .validate(DataSourceSchema)
    .get(`/organisations/${organisationPublicId}/data-sources/${dataSourceId}`, accessToken);
};

export const getDataSources = async (
  { organisationPublicId }: { organisationPublicId: string },
  accessToken?: string
): Promise<DataSource[]> => {
  return await backendHttpClient.get<DataSource[]>(`/organisations/${organisationPublicId}/data-sources`, accessToken);
};

export const createDataSource = async (
  { dataSourceCreate, organisationPublicId }: { dataSourceCreate: DataSourceCreate; organisationPublicId: string },
  accessToken: string
): Promise<DataSource> => {
  return await backendHttpClient.post<DataSource>(
    `/organisations/${organisationPublicId}/data-sources`,
    dataSourceCreate,
    accessToken
  );
};

export const updateDataSource = async (
  {
    dataSourceUpdate,
    organisationPublicId,
    dataSourceId,
  }: {
    dataSourceUpdate: DataSourceUpdate;
    organisationPublicId: string;
    dataSourceId?: number;
  },
  accessToken: string
): Promise<DataSource> => {
  if (!dataSourceId) throw new Error("dataSourceId is required");

  return await backendHttpClient.put<DataSource>(
    `/organisations/${organisationPublicId}/data-sources/${dataSourceId}`,
    dataSourceUpdate,
    accessToken
  );
};
