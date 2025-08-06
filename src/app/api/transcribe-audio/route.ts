import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as transcribe } from "ai";

export async function POST(req: Request) {
  try {
    // Get the audio file from the request
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response("No audio file provided", { status: 400 });
    }

    // Convert File to Uint8Array
    const arrayBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Transcribe the audio
    const transcript = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: uint8Array,
    });

    // Return the transcript data
    return Response.json(transcript);
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return new Response("Failed to transcribe audio", { status: 500 });
  }
}
