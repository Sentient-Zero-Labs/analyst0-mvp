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

export const OrganisationUserAddSchema = z.object({
  email: z.string().email(),
  role: UserRoleSchema.default("user"),
});

export const OrganisationUserResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  organisation_id: z.number(),
  role: UserRoleSchema,
  user_email: z.string().email(),
});

export const OrganisationUsersResponseSchema = z.array(OrganisationUserResponseSchema);

export const OrganisationListResponseSchema = z.array(OrganisationListResponseItemSchema);

export type OrganisationCreate = z.infer<typeof OrganisationCreateSchema>;
export type OrganisationUpdate = z.infer<typeof OrganisationUpdateSchema>;
export type Organisation = z.infer<typeof OrganisationSchema>;
export type OrganisationListResponseItem = z.infer<typeof OrganisationListResponseItemSchema>;
export type OrganisationUserAdd = z.infer<typeof OrganisationUserAddSchema>;
export type OrganisationUserResponse = z.infer<typeof OrganisationUserResponseSchema>;
