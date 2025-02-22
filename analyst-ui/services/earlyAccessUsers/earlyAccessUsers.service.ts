import { useMutation } from "@tanstack/react-query";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { EarlyAccessUserCreate } from "./earlyAccessUsers.schema";

export const useCreateEarlyAccessUserMutation = () => {
  return useMutation({
    mutationFn: async (earlyAccessUser: EarlyAccessUserCreate) => {
      return await createEarlyAccessUser(earlyAccessUser);
    },
  });
};

export const createEarlyAccessUser = async (earlyAccessUser: EarlyAccessUserCreate) => {
  return await backendHttpClient.post("/early-access-users", earlyAccessUser);
};
