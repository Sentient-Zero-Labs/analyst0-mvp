import { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";

export interface CustomUser extends User {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

export interface CustomSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  provider?: string;
  user?: CustomUser;
}

export interface CustomJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  provider?: string;
}
