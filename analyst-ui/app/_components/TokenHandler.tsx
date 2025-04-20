"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { getOrganisationList } from "@/services/organisation/organisation.service";
import { Session } from "@/services/auth/auth.schema";

export default function TokenHandler() {
  const router = useRouter();

  useEffect(() => {
    const checkLocalStorageTokens = async () => {
      try {
        // Check if we have tokens in localStorage
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const tokenExpiry = localStorage.getItem('tokenExpiry');

        console.log("[TokenHandler] Checking localStorage tokens", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          tokenExpiry
        });

        if (!accessToken || !refreshToken) {
          console.log("[TokenHandler] No tokens in localStorage");
          return;
        }

        // Check if token is expired
        const expiryTime = parseInt(tokenExpiry || '0', 10) * 1000;
        const isExpired = Date.now() > expiryTime;

        if (isExpired && refreshToken) {
          console.log("[TokenHandler] Token expired, attempting refresh");
          try {
            const response = await backendHttpClient.post<Session>("/auth/refresh", {
              refresh_token: refreshToken
            });

            if (response) {
              console.log("[TokenHandler] Token refresh successful");
              localStorage.setItem('accessToken', response.access_token);
              localStorage.setItem('refreshToken', response.refresh_token || refreshToken);
              localStorage.setItem('tokenExpiry', response.expires_at.toString());
            }
          } catch (refreshError) {
            console.error("[TokenHandler] Token refresh failed:", refreshError);
            // Clear invalid tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiry');
            return;
          }
        }

        // Use the token to fetch organisations
        try {
          const currentAccessToken = localStorage.getItem('accessToken');
          console.log("[TokenHandler] Fetching organisations with token");
          const organisations = await getOrganisationList(currentAccessToken || '');

          if (organisations && organisations.length > 0) {
            console.log("[TokenHandler] Organisations fetched, redirecting");
            router.push(`/organisation/${organisations[0].public_id}/projects`);
          } else {
            console.log("[TokenHandler] No organisations found, redirecting to create");
            router.push("/organisation/create");
          }
        } catch (orgError) {
          console.error("[TokenHandler] Error fetching organisations:", orgError);
        }
      } catch (error) {
        console.error("[TokenHandler] Error in token handler:", error);
      }
    };

    // Only run on the home page
    if (window.location.pathname === '/') {
      checkLocalStorageTokens();
    }
  }, [router]);

  // This component doesn't render anything
  return null;
}
