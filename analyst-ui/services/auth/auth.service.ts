import { useMutation } from "@tanstack/react-query";
import { User } from "../user/user.schema";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { ResendEmailVerification } from "./auth.schema";

export const useUserCreateMutation = () => {
  return useMutation({
    mutationFn: async (user: { email: string; password: string }) => {
      return await createUser(user);
    },
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      return await verifyEmail(token);
    },
  });
};

export const useResendEmailVerificationMutation = () => {
  return useMutation({
    mutationFn: async (email: ResendEmailVerification) => {
      return await resendEmailVerification(email);
    },
  });
};

export const createUser = async (user: { email: string; password: string }): Promise<User> => {
  return await backendHttpClient.post<User>("/auth/register", user);
};

export const verifyEmail = async (token: string) => {
  return await backendHttpClient.post("/auth/verify-email", { token });
};

export const resendEmailVerification = async (email: ResendEmailVerification) => {
  return await backendHttpClient.post("/auth/resend-verification", email);
};
