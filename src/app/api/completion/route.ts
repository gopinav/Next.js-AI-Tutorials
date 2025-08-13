import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const { text } = await generateText({
      model: openai("gpt-5-nano"),
      prompt,
    });

    return Response.json({ text });
  } catch (error) {
    console.error("Error generating text:", error);
    return Response.json({ error: "Failed to generate text" }, { status: 500 });
  }
}
