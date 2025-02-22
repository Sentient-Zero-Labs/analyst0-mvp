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
        // First-time login, save the `access_token`, its expiry and the `refresh_token`
        return {
          ...customToken,
          accessToken: customUser.access_token,
          refreshToken: customUser.refresh_token,
          expiresAt: customUser.expires_at,
          provider: account.provider,
        };
      } else if (customToken.expiresAt && Date.now() < customToken.expiresAt * 1000) {
        // Subsequent logins, but the `access_token` is still valid

        return customToken;
      } else {
        // Subsequent logins, but the `access_token` has expired, try to refresh it
        if (!customToken.refreshToken) throw new TypeError("Missing refresh_token");

        try {
          const response = await backendHttpClient.post<Session>("/auth/refresh", {
            refresh_token: customToken.refreshToken,
          });

          if (response) {
            // Update the token with the new access token and expiry
            customToken.accessToken = response.access_token;
            customToken.expiresAt = response.expires_at;
            // Preserve the refresh token if a new one wasn't issued
            if (response.refresh_token) {
              customToken.refreshToken = response.refresh_token;
            }
            return customToken;
          } else {
            throw new Error("Failed to refresh token");
          }
        } catch (error) {
          console.error("Error refreshing access_token", error);
          // If we fail to refresh the token, return an error so we can handle it on the page
          customToken.error = "RefreshTokenError";
          return customToken;
        }
      }
    },
    async session({ session, token }): Promise<CustomSession> {
      if (!token) return session;

      const customSession = session as CustomSession;
      const customToken = token as CustomJWT;

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
