import { User } from "./user.schema";
import { getSession } from "@/lib/auth/session";
import { QueryResult } from "../query-result";
import { useCurrentSession } from "@/lib/auth/session/react";

export const useUserQuery = (): QueryResult<User> & { unauthenticated: boolean } => {
  const { session, status } = useCurrentSession();
  const user = session?.user as User;

  return { data: user, isLoading: status === "loading", unauthenticated: status === "unauthenticated" };
};

export const getUser = async (): Promise<User | undefined> => {
  const session = await getSession();
  return session.user as User;
};
