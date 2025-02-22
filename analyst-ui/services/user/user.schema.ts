import { z } from "zod";

export const UserBaseSchema = z.object({
  email: z.string(),
  name: z.string(),
});

export const UserCreateSchema = UserBaseSchema.extend({
  password: z.string(),
});

export const UserSchema = UserBaseSchema.extend({
  id: z.string(),
});

export type User = z.infer<typeof UserSchema>;
