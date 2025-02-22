import { z } from "zod";

export const OrganisationUsageSchema = z.object({
  daily_small_credit_limit: z.number(),
  daily_large_credit_limit: z.number(),
  daily_small_credit_count: z.number(),
  daily_large_credit_count: z.number(),
});

export type OrganisationUsage = z.infer<typeof OrganisationUsageSchema>;
