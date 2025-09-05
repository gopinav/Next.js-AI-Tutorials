// src/app/api/message-metadata/types.ts
import { UIMessage } from "ai";
import { z } from "zod";

// Define your metadata schema
export const messageMetadataSchema = z.object({
  createdAt: z.number().optional(),
  totalTokens: z.number().optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

// Create a typed UIMessage
export type MyUIMessage = UIMessage<MessageMetadata>;
