import { z } from "zod";

const ColumnInfoSchema = z.object({
  name: z.string(),
  type: z.string(),
  enum_values: z.array(z.string()).optional().nullable(),
  description: z.string().default(""),
});

const IndexInfoSchema = z.object({
  name: z.string(),
  columns: z.array(z.string()),
});

const ForeignKeyInfoSchema = z.object({
  column: z.string(),
  referred_column: z.string(),
  referred_table_name: z.string(),
  description: z.string().default(""),
});

const DataEntityBaseSchema = z.object({
  name: z.string().min(1).max(255),
  schema_name: z.string().min(1).max(255).nullable(),
  description: z.string().optional().nullable(),
  columns: z.array(ColumnInfoSchema),
  indexes: z.array(IndexInfoSchema),
  foreign_keys: z.array(ForeignKeyInfoSchema),
});

export const DataEntityCreateSchema = DataEntityBaseSchema.extend({
  data_source_id: z.number().optional(),
  organisation_id: z.number().optional(),
});

export const DataEntityUpdateSchema = DataEntityBaseSchema.extend({
  id: z.number(),
});

export const DataEntityResponseSchema = DataEntityBaseSchema.extend({
  id: z.number(),
  data_source_id: z.number(),
  data_source_name: z.string().optional().nullable(),
});

export const DataEntityListResponseItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  schema_name: z.string(),
  organisation_id: z.number(),
  data_source_name: z.string(),
  data_source_id: z.number(),
  data_source_type: z.string(),
  columns: z.array(ColumnInfoSchema).optional().nullable(),
  foreign_keys: z.array(ForeignKeyInfoSchema).optional().nullable(),
  indexes: z.array(IndexInfoSchema).optional().nullable(),
});

export type ColumnInfo = z.infer<typeof ColumnInfoSchema>;
export type IndexInfo = z.infer<typeof IndexInfoSchema>;
export type ForeignKeyInfo = z.infer<typeof ForeignKeyInfoSchema>;
export type DataEntityBase = z.infer<typeof DataEntityBaseSchema>;
export type DataEntityCreate = z.infer<typeof DataEntityCreateSchema>;
export type DataEntityUpdate = z.infer<typeof DataEntityUpdateSchema>;
export type DataEntityResponse = z.infer<typeof DataEntityResponseSchema>;
export type DataEntityListResponseItem = z.infer<typeof DataEntityListResponseItemSchema>;
