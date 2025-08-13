import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { recipeSchema } from "./schema";

export async function POST(req: Request) {
  try {
    const { dish } = await req.json();

    console.log({ dish });

    const result = streamObject({
      model: openai("gpt-5-nano"),
      schema: recipeSchema,
      prompt: `Generate a recipe for ${dish}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating recipe:", error);
    return new Response("Failed to generate recipe", { status: 500 });
  }
}
