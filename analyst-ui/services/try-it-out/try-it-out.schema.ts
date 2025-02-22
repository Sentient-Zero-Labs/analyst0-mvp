import { z } from "zod";

export const SampleDataSchema = z.object({
  data: z.array(z.record(z.string(), z.any())).optional().nullable(),
  error: z.string().optional().nullable(),
});

export type SampleData = z.infer<typeof SampleDataSchema>;
