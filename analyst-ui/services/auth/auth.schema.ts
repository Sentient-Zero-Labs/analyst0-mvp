import { z } from "zod";

export const SessionSchema = z.object({
  id: z.string(),
  email: z.string(),
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const SignUpSchema = SignInSchema.extend({
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export const ResendEmailVerificationSchema = z.object({
  email: z.string().email(),
});

export type Session = z.infer<typeof SessionSchema>;
export type SignIn = z.infer<typeof SignInSchema>;
export type SignUp = z.infer<typeof SignUpSchema>;
export type ResendEmailVerification = z.infer<typeof ResendEmailVerificationSchema>;
