import { z } from "zod";

export const DataCallSchema = z.object({
  query: z.string().optional().nullable(),
  data_entity_names: z.array(z.string()).optional().nullable(),
  explanation: z.string().optional().nullable(),
  error: z.string().optional().nullable(),
  // Any array of objects
  data: z.array(z.any()).optional().nullable(),
});

export const MessageSchema = z.object({
  role: z.string(),
  content: z.string().optional().nullable(),
  data_call: DataCallSchema.optional().nullable(),
});

export const MessagesSchema = z.array(MessageSchema);

export type Message = z.infer<typeof MessageSchema>;
export type Messages = z.infer<typeof MessagesSchema>;
export type DataCallResponse = z.infer<typeof DataCallSchema>;
