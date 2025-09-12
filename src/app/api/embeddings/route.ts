import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if we're dealing with multiple texts
    if (Array.isArray(body.texts)) {
      const { values, embeddings, usage } = await embedMany({
        model: openai.textEmbeddingModel("text-embedding-3-small"),
        values: body.texts,
        maxParallelCalls: 5,
      });

      return Response.json({
        values,
        embeddings,
        usage,
        count: embeddings.length,
        dimensions: embeddings[0]?.length,
      });
    }

    // Single text embedding (our existing code)
    const { text } = body;
    const { value, embedding, usage } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      value: text,
    });

    return Response.json({
      value,
      embedding,
      usage,
      dimensions: embedding.length,
    });
  } catch (error) {
    console.error("Error generating embedding:", error);
    return Response.json(
      { error: "Failed to generate embedding" },
      { status: 500 }
    );
  }
}
