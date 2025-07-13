import { streamText } from "ai";
// import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    // model: openai("gpt-4.1-nano"),
    model: anthropic("claude-sonnet-4-20250514"),
    prompt,
  });

  return result.toUIMessageStreamResponse();
}
