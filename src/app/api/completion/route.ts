import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const { text } = await generateText({
    model: openai("gpt-4.1-nano"),
    prompt,
  });

  return Response.json({ text });
}
