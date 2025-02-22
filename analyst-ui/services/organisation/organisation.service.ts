import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Organisation,
  OrganisationCreate,
  OrganisationUpdate,
  OrganisationListResponseItem,
  OrganisationListResponseSchema,
} from "./organisation.schema";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { useCurrentSession } from "@/lib/auth/session/react";

// Fetch list of organisations
export const useOrganisationListQuery = () => {
  const { session } = useCurrentSession();

  return useQuery<OrganisationListResponseItem[], Error>({
    queryKey: ["organisations"],
    queryFn: () => getOrganisationList(session!.accessToken!),
    enabled: !!session?.accessToken,
  });
};

// Create a new project
export const useCreateOrganisationMutation = () => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (organisation: OrganisationCreate) => {
      return await createOrganisation(organisation, session?.accessToken);
    },
  });
};

// Update an existing organisation
export const useUpdateOrganisationMutation = () => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (organisation: OrganisationUpdate) => {
      return await updateOrganisation(organisation, session!.accessToken!);
    },
  });
};

// Delete an organisation
export const useDeleteOrganisationMutation = () => {
  const { session } = useCurrentSession();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteOrganisation(id, session!.accessToken!);
    },
  });
};

// Helper functions for API calls
export const getOrganisationList = async (accessToken?: string): Promise<OrganisationListResponseItem[]> => {
  return await backendHttpClient
    .validate(OrganisationListResponseSchema)
    .get<OrganisationListResponseItem[]>("/organisations", accessToken);
};

export const getOrganisationByPublicId = async (
  { publicId }: { publicId: string },
  accessToken?: string
): Promise<Organisation> => {
  return await backendHttpClient.get<Organisation>(`/organisations/${publicId}`, accessToken);
};

export const createOrganisation = async (
  organisation: OrganisationCreate,
  accessToken?: string
): Promise<Organisation> => {
  if (!accessToken) throw new Error("Access token is required");

  return await backendHttpClient.post<Organisation>("/organisations", organisation, accessToken);
};

export const updateOrganisation = async (
  organisation: OrganisationUpdate,
  accessToken: string
): Promise<Organisation> => {
  return await backendHttpClient.put<Organisation>(`/organisations/${organisation.id}`, organisation, accessToken);
};

export const deleteOrganisation = async (id: number, accessToken: string): Promise<void> => {
  await backendHttpClient.delete(`/organisations/${id}`, accessToken);
};
