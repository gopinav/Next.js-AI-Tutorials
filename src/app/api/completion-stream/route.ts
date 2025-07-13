import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: openai("gpt-4.1-nano"),
    prompt,
  });

  return result.toUIMessageStreamResponse();
}
