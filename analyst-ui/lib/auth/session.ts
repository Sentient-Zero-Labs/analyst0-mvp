import { CustomSession } from "./custom-auth";
import { auth } from "./auth";

export const getSession = async (): Promise<CustomSession> => {
  return (await auth()) as CustomSession;
};

