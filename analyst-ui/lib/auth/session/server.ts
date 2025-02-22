import { auth } from "../auth";
import { CustomSession } from "../custom-auth";

export const getSession = async (): Promise<CustomSession> => {
  return (await auth()) as CustomSession;
};
