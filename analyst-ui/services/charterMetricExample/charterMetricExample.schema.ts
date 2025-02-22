import { z } from "zod";

export const CharterMetricExampleCreateSchema = z.object({
  query: z.string(),
  explanation: z.string(),
});

export const CharterMetricExampleUpdateSchema = z.object({
  query: z.string(),
  explanation: z.string(),
});

export const CharterMetricExampleSchema = z.object({
  id: z.number(),
  query: z.string(),
  explanation: z.string(),
  charter_metric_id: z.number(),
});

export const CharterMetricExampleExplainInputSchema = z.object({
  query: z.string(),
});

export const CharterMetricExampleExlpainResponseSchema = z.object({
  query: z.string(),
  explanation: z.string(),
});

export const CharterMetricExampleListSchema = z.array(CharterMetricExampleSchema);

export type CharterMetricExampleCreate = z.infer<typeof CharterMetricExampleCreateSchema>;
export type CharterMetricExampleUpdate = z.infer<typeof CharterMetricExampleUpdateSchema>;
export type CharterMetricExample = z.infer<typeof CharterMetricExampleSchema>;
export type CharterMetricExampleList = z.infer<typeof CharterMetricExampleListSchema>;
export type CharterMetricExampleExplainInput = z.infer<typeof CharterMetricExampleExplainInputSchema>;
export type CharterMetricExampleExplainResponse = z.infer<typeof CharterMetricExampleExlpainResponseSchema>;
