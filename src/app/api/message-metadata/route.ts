// app/api/message-metadata/route.ts
import { streamText, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import type { MyUIMessage } from "./types";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: MyUIMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-5-nano"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === "start") {
          return {
            createdAt: Date.now(),
          };
        }
        if (part.type === "finish") {
          console.log(part.totalUsage);
          return {
            totalTokens: part.totalUsage.totalTokens,
          };
        }
      },
    });
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
