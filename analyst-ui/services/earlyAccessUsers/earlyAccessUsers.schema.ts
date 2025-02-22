import { z } from "zod";

export const EarlyAccessUserUsageTypeMap = {
  personal_use: "For personal use",
  team_use: "For team use",
};
export const EarlyAccessUserUsageFeatureMap = {
  slack_chat_feature: "Slack/Chat Feature",
  playground_feature: "SQL Playground",
  both: "Both",
};

export const EarlyAccessUserUsageTypeSchema = z.enum(["personal_use", "team_use"]);
export const EarlyAccessUserUsageFeatureSchema = z.enum(["slack_chat_feature", "playground_feature", "both"]);

export const EarlyAccessUserCreateSchema = z.object({
  email: z.string().email(),
  usage_type: EarlyAccessUserUsageTypeSchema,
  usage_feature: EarlyAccessUserUsageFeatureSchema,
  explanation: z.string(),
});

export type EarlyAccessUserCreate = z.infer<typeof EarlyAccessUserCreateSchema>;
export type EarlyAccessUserUsageType = z.infer<typeof EarlyAccessUserUsageTypeSchema>;
export type EarlyAccessUserUsageFeature = z.infer<typeof EarlyAccessUserUsageFeatureSchema>;
