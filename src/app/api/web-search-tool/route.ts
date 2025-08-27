import {
  streamText,
  UIMessage,
  convertToModelMessages,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";
// import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

const tools = {
  // web_search_preview: openai.tools.webSearchPreview({}),
  web_search: anthropic.tools.webSearch_20250305({
    maxUses: 1,
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const result = streamText({
      // model: openai.responses("gpt-5-nano"),
      model: anthropic("claude-sonnet-4-20250514"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
    });
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
