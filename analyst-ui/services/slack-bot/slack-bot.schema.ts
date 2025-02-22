import { z } from "zod";

export const SlackBotInstallUrlResponseSchema = z.object({
  auth_url: z.string(),
});

export type SlackBotInstallUrlResponse = z.infer<typeof SlackBotInstallUrlResponseSchema>;
