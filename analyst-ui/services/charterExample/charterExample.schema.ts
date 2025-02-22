import { z } from "zod";

export const CharterExampleCreateSchema = z.object({
  query: z.string(),
  explanation: z.string(),
});

export const CharterExampleUpdateSchema = z.object({
  query: z.string(),
  explanation: z.string(),
});

export const CharterExampleSchema = z.object({
  id: z.number(),
  query: z.string(),
  explanation: z.string(),
  charter_id: z.number(),
});

export const CharterExampleExplainInputSchema = z.object({
  query: z.string(),
});

export const CharterExampleExlpainResponseSchema = z.object({
  query: z.string(),
  explanation: z.string(),
});


export const CharterExampleListSchema = z.array(CharterExampleSchema);

export type CharterExampleCreate = z.infer<typeof CharterExampleCreateSchema>;
export type CharterExampleUpdate = z.infer<typeof CharterExampleUpdateSchema>;
export type CharterExample = z.infer<typeof CharterExampleSchema>;
export type CharterExampleList = z.infer<typeof CharterExampleListSchema>;
export type CharterExampleExplainInput = z.infer<typeof CharterExampleExplainInputSchema>;
export type CharterExampleExplainResponse = z.infer<typeof CharterExampleExlpainResponseSchema>;
