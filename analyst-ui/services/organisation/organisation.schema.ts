import { z } from "zod";

export const UserRoleSchema = z.enum(["admin", "user"]);

export const OrganisationCreateSchema = z.object({
  name: z.string(),
});

export const OrganisationUpdateSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const OrganisationSchema = z.object({
  id: z.number(),
  public_id: z.string(),
  name: z.string(),
});

export const OrganisationListResponseItemSchema = z.object({
  id: z.number(),
  public_id: z.string(),
  name: z.string(),
  is_slack_bot_enabled: z.boolean(),
  data_source_count: z.number(),
  user_role: UserRoleSchema,
});

export const OrganisationListResponseSchema = z.array(OrganisationListResponseItemSchema);

export type OrganisationCreate = z.infer<typeof OrganisationCreateSchema>;
export type OrganisationUpdate = z.infer<typeof OrganisationUpdateSchema>;
export type Organisation = z.infer<typeof OrganisationSchema>;
export type OrganisationListResponseItem = z.infer<typeof OrganisationListResponseItemSchema>;
