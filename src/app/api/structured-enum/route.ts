import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const result = await generateObject({
      model: openai("gpt-5-mini"), // gpt-5-mini supports enum better
      output: "enum",
      enum: ["positive", "negative", "neutral"],
      prompt: `Classify the sentiment in this text: "${text}"`,
    });

    return result.toJsonResponse();
  } catch (error) {
    console.error("Error generating sentiment:", error);
    return new Response("Failed to generate sentiment", { status: 500 });
  }
}
