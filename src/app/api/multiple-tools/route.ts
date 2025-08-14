import {
  UIMessage,
  UIDataTypes,
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
  InferUITools,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const tools = {
  getLocation: tool({
    description: "Get the location of a user",
    inputSchema: z.object({
      name: z.string().describe("The name of the user"),
    }),
    execute: async ({ name }) => {
      if (name === "Bruce Wayne") {
        return "Gotham City";
      } else if (name === "Clark Kent") {
        return "Metropolis";
      } else {
        return "Unknown";
      }
    },
  }),
  getWeather: tool({
    description: "Get the weather for a location",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
    execute: async ({ city }) => {
      if (city === "Gotham City") {
        return "70°F and cloudy";
      } else if (city === "Metropolis") {
        return "80°F and sunny";
      } else {
        return "Unknown";
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-5-mini"),
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(3),
      tools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
