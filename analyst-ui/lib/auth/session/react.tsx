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

  console.log("[SessionHook] Initializing session hook", { pathName });

  const retrieveSession = useCallback(async () => {
    console.log("[SessionHook] Retrieving session");
    try {
      const sessionData = await getSession();
      console.log("[SessionHook] Session data retrieved", {
        hasSession: !!sessionData,
        hasAccessToken: !!(sessionData as CustomSession)?.accessToken,
        expiresAt: (sessionData as CustomSession)?.expiresAt
      });

      if (sessionData && (sessionData as CustomSession)?.accessToken) {
        setSession(sessionData as CustomSession);
        setStatus("authenticated");
        console.log("[SessionHook] Session authenticated");
        return;
      }

      console.log("[SessionHook] No valid session data, setting unauthenticated");
      setStatus("unauthenticated");

      // If we're on the home page and don't have a valid session, try to reload once
      if (pathName === '/' && !sessionStorage.getItem('sessionReloadAttempt')) {
        console.log("[SessionHook] On home page without session, attempting reload");
        sessionStorage.setItem('sessionReloadAttempt', 'true');
        setTimeout(() => {
          console.log("[SessionHook] Reloading page to initialize session");
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("[SessionHook] Error retrieving session:", error);
      setStatus("unauthenticated");
      setSession(null);
    }
  }, [pathName]);

  useEffect(() => {
    console.log("[SessionHook] useEffect running", {
      hasSession: !!session,
      pathName
    });

    // We only want to retrieve the session when there is no session
    if (!session) {
      console.log("[SessionHook] No session, retrieving");
      retrieveSession();
    } else {
      console.log("[SessionHook] Session exists", {
        hasAccessToken: !!session.accessToken,
        expiresAt: session.expiresAt
      });
    }

    // If the session has an expiry date, we want to refresh the session before it expires
    let timeoutId: NodeJS.Timeout;
    if (session?.expiresAt) {
      const expiresAt = session.expiresAt * 1000;
      // We want to refresh the session 10 seconds before it expires
      const timeUntilExpiry = expiresAt - Date.now() - 10000;

      console.log("[SessionHook] Session expiry check", {
        expiresAt: new Date(expiresAt).toISOString(),
        timeUntilExpiry,
        willSetTimeout: timeUntilExpiry > 0
      });

      if (timeUntilExpiry > 0) {
        console.log("[SessionHook] Setting timeout to refresh session");
        timeoutId = setTimeout(() => {
          console.log("[SessionHook] Session refresh timeout triggered");
          retrieveSession();
        }, timeUntilExpiry);
      } else {
        console.log("[SessionHook] Session already expired or close to expiry");
      }
    }

    return () => {
      if (timeoutId) {
        console.log("[SessionHook] Clearing timeout");
        clearTimeout(timeoutId);
      }
    };
  }, [retrieveSession, session, pathName]);

  return { session, status };
};
