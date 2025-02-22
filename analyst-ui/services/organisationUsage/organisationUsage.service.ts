import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { OrganisationUsage } from "./organisationUsage.schema";

export const getOrganisationUsage = async (organisationPublicId: string, accessToken: string) => {
  return await backendHttpClient.get<OrganisationUsage>(`/organisation/${organisationPublicId}/usage`, accessToken);
};
