import { z } from "zod";
import { DataSourceListResponseSchema } from "../dataSource/dataSource.schema";
import { DataEntityListResponseItemSchema } from "../dataEntity/dataEntity.schema";

const CharterBaseSchema = z.object({
  name: z.string().min(1).max(255),
  data_source_id: z.number(),
  data_entity_ids: z.array(z.number()),
  slack_channel_ids: z.array(z.string()).optional().nullable(),
  example_questions: z.array(z.string()).optional().nullable(),
});

export const CharterCreateSchema = CharterBaseSchema;

export const CharterUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  data_source_id: z.number().optional(),
  data_entity_ids: z.array(z.number()),
  slack_channel_ids: z.array(z.string()).optional().nullable(),
});

export const CharterResponseSchema = CharterBaseSchema.extend({
  id: z.number(),
  organisation_id: z.number(),
  data_source: DataSourceListResponseSchema,
  data_entities: z.array(DataEntityListResponseItemSchema).optional().nullable(),
  data_entity_ids: z.array(z.number()).optional().nullable(),
  slack_channel_ids: z.array(z.string()).optional().nullable(),
});

export const CharterListResponseItemSchema = CharterResponseSchema.extend({
  metrics_count: z.number().optional().nullable(),
  examples_count: z.number().optional().nullable(),
  slack_channel_ids_count: z.number().optional().nullable(),
});

export const CharterListResponseSchema = z.array(CharterListResponseItemSchema);

export type CharterBase = z.infer<typeof CharterBaseSchema>;
export type CharterCreate = z.infer<typeof CharterCreateSchema>;
export type CharterUpdate = z.infer<typeof CharterUpdateSchema>;
export type CharterResponse = z.infer<typeof CharterResponseSchema>;
export type CharterListResponseItem = z.infer<typeof CharterListResponseItemSchema>;
export type CharterListResponse = z.infer<typeof CharterListResponseSchema>;
