// app/api/client-side-tools/route.ts

import {
  UIMessage,
  UIDataTypes,
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
  InferUITools,
  experimental_generateImage as generateImage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import ImageKit from "imagekit";

const uploadImage = async (image: string) => {
  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
  });

  const response = await imagekit.upload({
    file: image, // File content to upload
    fileName: "my_file_name.jpg", // Desired file name
  });

  return response.url;
};

const tools = {
  generateImage: tool({
    description: "Generate an image",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to generate an image for"),
    }),
    execute: async ({ prompt }) => {
      const { image } = await generateImage({
        model: openai.imageModel("dall-e-3"),
        prompt,
        size: "1024x1024",
        providerOptions: {
          openai: { style: "vivid", quality: "hd" },
        },
      });

      const imageUrl = await uploadImage(image.base64);

      return imageUrl;
    },
  }),
  changeBackground: tool({
    description:
      "Replace image background with AI-generated scenes based on text prompt",
    inputSchema: z.object({
      imageUrl: z.string().describe("URL of the uploaded image"),
      backgroundPrompt: z
        .string()
        .describe(
          'Description of the new background (e.g., "tropical beach sunset", "modern office", "mountain landscape")'
        ),
    }),
    outputSchema: z.string().describe("The transformed image URL"),
  }),
  removeBackground: tool({
    description: "Remove the background of an image",
    inputSchema: z.object({
      imageUrl: z.string().describe("URL of the uploaded image"),
    }),
    outputSchema: z.string().describe("The transformed image URL"),
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-5-nano"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(3),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
