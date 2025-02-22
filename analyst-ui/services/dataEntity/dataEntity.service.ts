import { useMutation, useQuery } from "@tanstack/react-query";
import {
  DataEntityCreate,
  DataEntityUpdate,
  DataEntityResponse,
  DataEntityListResponseItem,
} from "./dataEntity.schema";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useCurrentSession } from "@/lib/auth/session/react";

const getBaseUrl = (organisationPublicId: string, dataSourceId: number) =>
  `/organisation/${organisationPublicId}/data-source/${dataSourceId}/data-entity`;

export const useDataEntitiesForCharterQuery = ({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId?: number;
}) => {
  const { session } = useCurrentSession();

  return useQuery<DataEntityListResponseItem[], Error>({
    queryKey: ["data_entities_for_charter", organisationPublicId, charterId],
    queryFn: () => getDataEntitiesForCharter({ organisationPublicId, charterId: charterId! }, session!.accessToken!),
    enabled: !!session?.accessToken && !!organisationPublicId && !!charterId,
  });
};

// Fetch list of data entities
export const useDataEntitiesQuery = ({
  organisationPublicId,
  dataSourceId,
  type,
}: {
  organisationPublicId: string;
  dataSourceId: number;
  type?: "compact" | "detailed";
}) => {
  const { session } = useCurrentSession();

  return useQuery<DataEntityListResponseItem[], Error>({
    queryKey: ["data_entities", organisationPublicId, dataSourceId, type],
    queryFn: () => getDataEntitiesList({ organisationPublicId, dataSourceId, type }, session!.accessToken!),
    enabled: !!session?.accessToken && !!organisationPublicId && !!dataSourceId,
  });
};

// Create a new data entity
export const useCreateDataEntityMutation = ({
  organisationPublicId,
  dataSourceId,
}: {
  organisationPublicId: string;
  dataSourceId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (dataEntity: DataEntityCreate) => {
      return await createDataEntity(
        { dataEntityCreate: dataEntity, organisationPublicId, dataSourceId },
        session!.accessToken!
      );
    },
  });
};

// Fetch data entities from data source
export const useFetchDataEntitiesMutation = ({
  organisationPublicId,
  dataSourceId,
}: {
  organisationPublicId: string;
  dataSourceId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async () => {
      return await fetchDataEntitiesFromDataSource({ organisationPublicId, dataSourceId }, session!.accessToken!);
    },
  });
};

// Refetch data entity definition
export const useRefetchDataEntitySchemaMutation = ({
  organisationPublicId,
  dataSourceId,
  dataEntityId,
}: {
  organisationPublicId: string;
  dataSourceId: number;
  dataEntityId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async () => {
      return await refetchDataEntitySchema({ organisationPublicId, dataSourceId, dataEntityId }, session!.accessToken!);
    },
  });
};

// Create embeddings for all data entities
export const useCreateEmbeddingsMutation = ({
  organisationPublicId,
  dataSourceId,
}: {
  organisationPublicId: string;
  dataSourceId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async () => {
      return await createEmbeddings({ organisationPublicId, dataSourceId }, session!.accessToken!);
    },
  });
};

// Get sample data for a data entity
export const useFetchSampleDataMutation = ({
  organisationPublicId,
  dataSourceId,
  dataEntityId,
}: {
  organisationPublicId: string;
  dataSourceId: number;
  dataEntityId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async () => {
      return await getSampleDataEntity({ organisationPublicId, dataSourceId, dataEntityId }, session!.accessToken!);
    },
  });
};

// Get a single data entity
export const useDataEntityQuery = ({
  organisationPublicId,
  dataSourceId,
  dataEntityId,
}: {
  organisationPublicId: string;
  dataSourceId: number;
  dataEntityId?: number;
}) => {
  const { session } = useCurrentSession();

  return useQuery<DataEntityResponse, Error>({
    queryKey: ["data_entity", organisationPublicId, dataSourceId, dataEntityId],
    queryFn: () =>
      getDataEntity({ organisationPublicId, dataSourceId, dataEntityId: dataEntityId! }, session!.accessToken!),
    enabled: !!session?.accessToken && !!dataSourceId && !!dataEntityId,
  });
};

// Fetch description for a data entity
export const useFetchDataEntityMetadataMutation = ({
  organisationPublicId,
  dataSourceId,
  dataEntityId,
}: {
  organisationPublicId: string;
  dataSourceId: number;
  dataEntityId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async () => {
      return await fetchDataEntityMetadata({ organisationPublicId, dataSourceId, dataEntityId }, session!.accessToken!);
    },
  });
};

// Update a data entity
export const useUpdateDataEntityMutation = ({
  organisationPublicId,
  dataSourceId,
  dataEntityId,
}: {
  organisationPublicId: string;
  dataSourceId: number;
  dataEntityId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (dataEntityUpdate: DataEntityUpdate) => {
      return await updateDataEntity(
        { dataEntityUpdate, organisationPublicId, dataSourceId, dataEntityId },
        session!.accessToken!
      );
    },
  });
};

// Delete a data entity
export const useDeleteDataEntityMutation = ({
  organisationPublicId,
  dataSourceId,
  dataEntityId,
}: {
  organisationPublicId: string;
  dataSourceId: number;
  dataEntityId: number;
}) => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async () => {
      return await deleteDataEntity({ organisationPublicId, dataSourceId, dataEntityId }, session!.accessToken!);
    },
  });
};

export const getDataEntitiesForCharter = async (
  { organisationPublicId, charterId }: { organisationPublicId: string; charterId: number },
  accessToken: string
): Promise<DataEntityListResponseItem[]> => {
  return await backendHttpClient.get<DataEntityListResponseItem[]>(
    `/organisations/${organisationPublicId}/charters/${charterId}/data-entities`,
    accessToken
  );
};

// Helper functions for API calls
export const getDataEntitiesList = async (
  {
    organisationPublicId,
    dataSourceId,
    type = "compact",
  }: { organisationPublicId: string; dataSourceId: number; type?: "compact" | "detailed" },
  accessToken: string
): Promise<DataEntityListResponseItem[]> => {
  return await backendHttpClient.get<DataEntityListResponseItem[]>(
    `${getBaseUrl(organisationPublicId, dataSourceId)}/list?type=${type}`,
    accessToken
  );
};

export const createDataEntity = async (
  {
    dataEntityCreate,
    organisationPublicId,
    dataSourceId,
  }: { dataEntityCreate: DataEntityCreate; organisationPublicId: string; dataSourceId: number },
  accessToken: string
): Promise<DataEntityResponse> => {
  return await backendHttpClient.post<DataEntityResponse>(
    `${getBaseUrl(organisationPublicId, dataSourceId)}`,
    dataEntityCreate,
    accessToken
  );
};

export const fetchDataEntitiesFromDataSource = async (
  { organisationPublicId, dataSourceId }: { organisationPublicId: string; dataSourceId: number },
  accessToken: string
): Promise<void> => {
  await backendHttpClient.post(`${getBaseUrl(organisationPublicId, dataSourceId)}/fetch`, {}, accessToken);
};

export const refetchDataEntitySchema = async (
  {
    organisationPublicId,
    dataSourceId,
    dataEntityId,
  }: { organisationPublicId: string; dataSourceId: number; dataEntityId: number },
  accessToken: string
): Promise<DataEntityResponse> => {
  return await backendHttpClient.post<DataEntityResponse>(
    `${getBaseUrl(organisationPublicId, dataSourceId)}/${dataEntityId}/schema/refetch`,
    {},
    accessToken
  );
};

export const createEmbeddings = async (
  { organisationPublicId, dataSourceId }: { organisationPublicId: string; dataSourceId: number },
  accessToken: string
): Promise<DataEntityResponse[]> => {
  return await backendHttpClient.post<DataEntityResponse[]>(
    `${getBaseUrl(organisationPublicId, dataSourceId)}/create-embeddings`,
    {},
    accessToken
  );
};

export const getDataEntity = async (
  {
    organisationPublicId,
    dataSourceId,
    dataEntityId,
  }: { organisationPublicId: string; dataSourceId: number; dataEntityId: number },
  accessToken: string
): Promise<DataEntityResponse> => {
  return await backendHttpClient.get<DataEntityResponse>(
    `${getBaseUrl(organisationPublicId, dataSourceId)}/${dataEntityId}`,
    accessToken
  );
};

export const getSampleDataEntity = async (
  {
    organisationPublicId,
    dataSourceId,
    dataEntityId,
  }: { organisationPublicId: string; dataSourceId: number; dataEntityId: number },
  accessToken: string
): Promise<DataEntityResponse> => {
  return await backendHttpClient.get<DataEntityResponse>(
    `${getBaseUrl(organisationPublicId, dataSourceId)}/${dataEntityId}/sample-data`,
    accessToken
  );
};

export const fetchDataEntityMetadata = async (
  {
    organisationPublicId,
    dataSourceId,
    dataEntityId,
  }: { organisationPublicId: string; dataSourceId: number; dataEntityId: number },
  accessToken: string
): Promise<DataEntityResponse> => {
  return await backendHttpClient.post<DataEntityResponse>(
    `${getBaseUrl(organisationPublicId, dataSourceId)}/${dataEntityId}/metadata/fetch`,
    {},
    accessToken
  );
};

export const updateDataEntity = async (
  {
    dataEntityUpdate,
    organisationPublicId,
    dataSourceId,
    dataEntityId,
  }: { dataEntityUpdate: DataEntityUpdate; organisationPublicId: string; dataSourceId: number; dataEntityId: number },
  accessToken: string
): Promise<DataEntityResponse> => {
  return await backendHttpClient.put<DataEntityResponse>(
    `${getBaseUrl(organisationPublicId, dataSourceId)}/${dataEntityId}`,
    dataEntityUpdate,
    accessToken
  );
};

export const deleteDataEntity = async (
  {
    organisationPublicId,
    dataSourceId,
    dataEntityId,
  }: { organisationPublicId: string; dataSourceId: number; dataEntityId: number },
  accessToken: string
): Promise<void> => {
  await backendHttpClient.delete(`${getBaseUrl(organisationPublicId, dataSourceId)}/${dataEntityId}`, accessToken);
};
