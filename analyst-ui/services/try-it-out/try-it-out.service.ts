import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useQuery } from "@tanstack/react-query";
import { SampleData } from "./try-it-out.schema";

const getBaseUrl = () => `/try-it-out`;

export const useTryItOutSampleDataForDataEntityQuery = ({
  charterId,
  dataEntityId,
}: {
  charterId?: number;
  dataEntityId: number;
}) => {
  return useQuery<SampleData, Error>({
    queryKey: ["try_it_out_sample_data_for_data_entity", charterId, dataEntityId],
    queryFn: () => getSampleDataForDataEntity({ charterId: charterId!, dataEntityId }),
    enabled: !!dataEntityId && !!charterId,
  });
};

export const getSampleDataForDataEntity = async ({
  charterId,
  dataEntityId,
}: {
  charterId: number;
  dataEntityId: number;
}): Promise<SampleData> => {
  return await backendHttpClient.get<SampleData>(
    `${getBaseUrl()}/charters/${charterId}/data-entities/${dataEntityId}/sample-data`
  );
};
