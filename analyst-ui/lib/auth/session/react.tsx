"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getSession } from "next-auth/react";
import { CustomSession } from "../custom-auth";
import { createContext, useContext, PropsWithChildren } from "react";

// Define the SessionContext type
type SessionContextType = {
  session: CustomSession | null;
  status: string;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: PropsWithChildren) {
  const sessionData = useCurrentSessionHook();
  return <SessionContext.Provider value={sessionData}>{children}</SessionContext.Provider>;
}

export function useCurrentSession() {
  const pathName = usePathname();

  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }

  // If the user is on the try it out page, we need to set the session to the try it out access token.
  // This will allow the user to access the page without having to login.
  if (pathName.startsWith("/try-supr-analyst")) {
    return {
      session: { accessToken: process.env.NEXT_PUBLIC_TRY_IT_OUT_ACCESS_TOKEN },
      status: "authenticated",
    } as SessionContextType;
  }

  return context;
}

export const useCurrentSessionHook = () => {
  const [session, setSession] = useState<CustomSession | null>(null);
  // Changed the default status to loading
  const [status, setStatus] = useState<string>("loading");
  const pathName = usePathname();

  const retrieveSession = useCallback(async () => {
    try {
      const sessionData = await getSession();
      if (sessionData) {
        setSession(sessionData);
        setStatus("authenticated");
        return;
      }

      setStatus("unauthenticated");
    } catch {
      setStatus("unauthenticated");
      setSession(null);
    }
  }, []);

  useEffect(() => {
    // We only want to retrieve the session when there is no session
    if (!session) retrieveSession();

    // If the session has an expiry date, we want to refresh the session before it expires
    let timeoutId: NodeJS.Timeout;
    if (session?.expiresAt) {
      const expiresAt = session.expiresAt * 1000;
      // We want to refresh the session 10 seconds before it expires
      const timeUntilExpiry = expiresAt - Date.now() - 10000;

      if (timeUntilExpiry > 0) {
        timeoutId = setTimeout(() => {
          retrieveSession();
        }, timeUntilExpiry);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [retrieveSession, session, pathName]);

  return { session, status };
};
