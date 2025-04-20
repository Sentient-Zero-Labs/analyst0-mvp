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

export const ChatResponseSchema = z.object({
  messages: MessagesSchema,
  conversation_id: z.string(),
});

export const ConversationSchema = z.object({
  conversation_id: z.string(),
  title: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  last_message: MessageSchema.nullable(),
});

export const ConversationsListSchema = z.array(ConversationSchema);

export type Message = z.infer<typeof MessageSchema>;
export type Messages = z.infer<typeof MessagesSchema>;
export type DataCallResponse = z.infer<typeof DataCallSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationsList = z.infer<typeof ConversationsListSchema>;
