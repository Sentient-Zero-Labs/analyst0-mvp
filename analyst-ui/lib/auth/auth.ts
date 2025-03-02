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
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const session = await backendHttpClient.post<Session>("/auth/login", {
            email: credentials.email,
            password: credentials.password,
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

          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          throw new CredentialsSignin((error as Error).message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }): Promise<CustomJWT> {
      const customUser = user as CustomUser;
      const customToken = token as CustomJWT;

      // First time login, saving the token
      if (account && user) {
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
        try {
          // Try to verify the token
          const headers = {
            Authorization: `Bearer ${customToken.accessToken}`,
          };
          
          await backendHttpClient.post("/auth/verify", null, "", headers);
          
          // If verification succeeds and token isn't close to expiry, return existing token
          if (customToken.expiresAt && Date.now() < (customToken.expiresAt * 1000) - 60000) {
            return customToken;
          }
        } catch (error) {
          // Token verification failed, try to refresh
          if (!customToken.refreshToken) {
            return { ...customToken, error: "TokenError" };
          }

          try {
            const response = await backendHttpClient.post<Session>("/auth/refresh", {
              refresh_token: customToken.refreshToken,
            });

            if (response) {
              // Successfully refreshed token, update session and continue
              return {
                ...customToken,
                accessToken: response.access_token,
                expiresAt: response.expires_at,
                refreshToken: response.refresh_token || customToken.refreshToken,
                error: undefined // Clear any previous errors
              };
            }
          } catch (refreshError) {
            return { ...customToken, error: "TokenError" };
          }
        }
      }

      return { ...customToken, error: "TokenError" };
    },
    async session({ session, token }): Promise<CustomSession> {
      const customSession = session as CustomSession;
      const customToken = token as CustomJWT;

      if (customToken.error === "TokenError") {
        await signOut({ redirect: false });
        return customSession;
      }

      // Update session with new token data
      customSession.accessToken = customToken.accessToken as string;
      customSession.refreshToken = customToken.refreshToken as string;
      customSession.expiresAt = customToken.expiresAt as number;
      customSession.provider = customToken.provider as string;

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
