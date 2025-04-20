"use server";

import NextAuth, { CredentialsSignin, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { CustomUser, CustomSession, CustomJWT } from "@/lib/auth/custom-auth";
import { backendHttpClient } from "@/lib/http-clients/backend-http-server";
import { Session } from "@/services/auth/auth.schema";

const authOptions: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials");
          return null;
        }

        try {
          console.log(`[Auth] Attempting to login with email: ${credentials.email}`);

          const session = await backendHttpClient.post<Session>("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          console.log("[Auth] Login response:", {
            id: session?.id,
            email: credentials.email,
            hasAccessToken: !!session?.access_token,
            hasRefreshToken: !!session?.refresh_token,
            expiresAt: session?.expires_at
          });

          if (session) {
            return {
              id: session.id,
              email: credentials.email as string,
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
            };
          }

          console.log("[Auth] No session returned from login");
          return null;
        } catch (error) {
          console.error("[Auth] Authentication error:", error);
          throw new CredentialsSignin((error as Error).message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }): Promise<CustomJWT> {
      const customUser = user as CustomUser;
      const customToken = token as CustomJWT;

      console.log("[Auth:jwt] Processing JWT callback", {
        hasUser: !!user,
        hasAccount: !!account,
        hasToken: !!token,
        tokenAccessToken: !!customToken?.accessToken,
        userAccessToken: !!customUser?.access_token
      });

      // First time login, saving the token
      if (account && user) {
        console.log("[Auth:jwt] First time login, saving token");
        return {
          ...customToken,
          accessToken: customUser.access_token,
          refreshToken: customUser.refresh_token,
          expiresAt: customUser.expires_at,
          provider: account.provider,
        };
      }

      // For subsequent requests, verify the token first
      if (customToken.accessToken) {
        console.log("[Auth:jwt] Token exists, verifying", {
          expiresAt: customToken.expiresAt,
          tokenExpired: customToken.expiresAt ? Date.now() > (customToken.expiresAt * 1000) : 'unknown'
        });

        try {
          // Try to verify the token
          const headers = {
            Authorization: `Bearer ${customToken.accessToken}`,
          };

          console.log("[Auth:jwt] Sending token verification request");
          await backendHttpClient.post("/auth/verify", null, "", headers);
          console.log("[Auth:jwt] Token verification successful");

          // If verification succeeds and token isn't close to expiry, return existing token
          if (customToken.expiresAt && Date.now() < (customToken.expiresAt * 1000) - 60000) {
            console.log("[Auth:jwt] Token not expired, returning existing token");
            return customToken;
          } else {
            console.log("[Auth:jwt] Token close to expiry, will attempt refresh");
          }
        } catch (_error) {
          // Add error logging
          console.error('[Auth:jwt] Token verification failed:', _error);

          if (!customToken.refreshToken) {
            console.error('[Auth:jwt] No refresh token available');
            return { ...customToken, error: "TokenError" };
          }

          try {
            console.log('[Auth:jwt] Attempting to refresh token');
            const response = await backendHttpClient.post<Session>("/auth/refresh", {
              refresh_token: customToken.refreshToken,
            });

            if (response) {
              console.log('[Auth:jwt] Token refresh successful');
              // Successfully refreshed token, update session and continue
              return {
                ...customToken,
                accessToken: response.access_token,
                expiresAt: response.expires_at,
                refreshToken: response.refresh_token || customToken.refreshToken,
                error: undefined // Clear any previous errors
              };
            } else {
              console.error('[Auth:jwt] Token refresh returned empty response');
            }
          } catch (_refreshError) {
            // Add error logging
            console.error('[Auth:jwt] Token refresh failed:', _refreshError);
            return { ...customToken, error: "TokenError" };
          }
        }
      } else {
        console.log("[Auth:jwt] No access token in JWT");
      }

      return { ...customToken, error: "TokenError" };
    },
    async session({ session, token }): Promise<CustomSession> {
      const customSession = session as CustomSession;
      const customToken = token as CustomJWT;

      console.log("[Auth:session] Processing session callback", {
        hasToken: !!token,
        tokenError: customToken.error,
        hasAccessToken: !!customToken.accessToken,
        hasRefreshToken: !!customToken.refreshToken,
        expiresAt: customToken.expiresAt
      });

      if (customToken.error === "TokenError") {
        console.log("[Auth:session] Token error detected, signing out");
        await signOut({ redirect: false });
        return customSession;
      }

      // Update session with new token data
      customSession.accessToken = customToken.accessToken as string;
      customSession.refreshToken = customToken.refreshToken as string;
      customSession.expiresAt = customToken.expiresAt as number;
      customSession.provider = customToken.provider as string;

      console.log("[Auth:session] Session updated with token data", {
        hasAccessToken: !!customSession.accessToken,
        hasRefreshToken: !!customSession.refreshToken,
        expiresAt: customSession.expiresAt
      });

      return customSession;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const userSession = await backendHttpClient.post<Session>("/auth/google", {
          email: user.email,
          name: user.name,
          google_id: user.id,
        });
        debugger;

        if (userSession) return true;

        return false;
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);

export { GET, POST, auth, signIn, signOut };
