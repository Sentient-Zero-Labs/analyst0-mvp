import { z } from "zod";

export const CharterMetricCreateSchema = z.object({
  name: z.string().min(1).max(255),
  abbreviation: z.string().min(1).max(20),
  description: z.string().min(1),
});

export const CharterMetricUpdateSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  abbreviation: z.string().min(1).max(20),
  description: z.string().min(1),
});

export const CharterMetricSchema = z.object({
  id: z.number(),
  name: z.string(),
  abbreviation: z.string(),
  description: z.string(),
  charter_id: z.number(),
  example_count: z.number().optional().default(0),
});

export const CharterMetricDescribeInputSchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  data_entity_ids: z.array(z.number()),
});

export const CharterMetricDescribeResponseSchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  description: z.string(),
});

export const CharterMetricListSchema = z.array(CharterMetricSchema);

export type CharterMetricCreate = z.infer<typeof CharterMetricCreateSchema>;
export type CharterMetricUpdate = z.infer<typeof CharterMetricUpdateSchema>;
export type CharterMetric = z.infer<typeof CharterMetricSchema>;
export type CharterMetricList = z.infer<typeof CharterMetricListSchema>;
export type CharterMetricDescribeInput = z.infer<typeof CharterMetricDescribeInputSchema>;
export type CharterMetricDescribeResponse = z.infer<typeof CharterMetricDescribeResponseSchema>;
