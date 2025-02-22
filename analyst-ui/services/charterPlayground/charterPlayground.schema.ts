import { z } from "zod";

export const CharterPlaygroundUpdateSchema = z.object({
  query: z.string().optional(),
  name: z.string().optional(),
});

export const CharterPlaygroundResponseSchema = z.object({
  charter_id: z.number(),
  user_id: z.number(),
  public_id: z.string(),
  name: z.string(),
  query: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CharterPlaygroundListResponseSchema = z.array(CharterPlaygroundResponseSchema);

export type CharterPlaygroundUpdate = z.infer<typeof CharterPlaygroundUpdateSchema>;
export type CharterPlaygroundResponse = z.infer<typeof CharterPlaygroundResponseSchema>;
export type CharterPlaygroundListResponseItem = z.infer<typeof CharterPlaygroundResponseSchema>;
export type CharterPlaygroundListResponse = z.infer<typeof CharterPlaygroundListResponseSchema>;

// Query result schema
export const CharterPlaygroundQueryResultSchema = z.object({
  data: z.array(z.record(z.string(), z.any())).optional().nullable(),
  error: z.string().optional().nullable(),
});

export type CharterPlaygroundQueryResult = z.infer<typeof CharterPlaygroundQueryResultSchema>;
