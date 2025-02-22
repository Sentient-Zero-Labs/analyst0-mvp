import { z } from "zod";
import { DataEntityResponseSchema } from "../dataEntity/dataEntity.schema";
import { CharterMetricSchema } from "../charterMetric/charterMetric.schema";
import { CharterMetricExampleSchema } from "../charterMetricExample/charterMetricExample.schema";

export type ModelNames = "gpt-4o" | "gpt-4o-mini" | "claude-3.5-haiku" | "claude-3.5-sonnet";

// Mapping of model names to model types and client names
export const ModelNameMapping: Record<ModelNames, { model_type: "large" | "small"; client_name: "openai" | "claude" }> =
  {
    "gpt-4o": { model_type: "large", client_name: "openai" },
    "gpt-4o-mini": { model_type: "small", client_name: "openai" },
    "claude-3.5-haiku": { model_type: "small", client_name: "claude" },
    "claude-3.5-sonnet": { model_type: "large", client_name: "claude" },
  };

// Importing related schemas (you'll need to adjust the import paths)
export const PlaygroundMessageContextSchema = z.object({
  query: z.string().optional(),
  data_entity_ids: z.array(z.number()).optional(),
  charter_metric_ids: z.array(z.number()).optional(),
  selected_texts: z.array(z.string()).optional(),

  data_entities: z.array(DataEntityResponseSchema).optional(),
  charter_metrics: z.array(CharterMetricSchema).optional(),
  charter_metric_examples: z.array(CharterMetricExampleSchema).optional(),
});

export const PlaygroundMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  context: PlaygroundMessageContextSchema.optional().nullable(),
});

export const PlaygroundChatInputSchema = z.object({
  messages: z.array(PlaygroundMessageSchema),
  model_type: z.enum(["small", "large"]),
  client_name: z.enum(["openai", "claude"]),
  conversation_id: z.string().optional().nullable(),
});

// Type definitions for TypeScript
export type PlaygroundMessageContext = z.infer<typeof PlaygroundMessageContextSchema>;
export type PlaygroundMessage = z.infer<typeof PlaygroundMessageSchema>;
export type PlaygroundChatInput = z.infer<typeof PlaygroundChatInputSchema>;
