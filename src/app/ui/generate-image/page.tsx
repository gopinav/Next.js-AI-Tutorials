"use client";

import Image from "next/image";
import { useState } from "react";

export default function GenerateImagePage() {
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setImageSrc(null);
    setError(null);
    setPrompt("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setImageSrc(`data:image/png;base64,${data}`);
    } catch (error) {
      console.error("Error generating image:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="relative w-full aspect-square mb-20">
        {isLoading ? (
          <div className="w-full h-full animate-pulse bg-gray-300 rounded-lg" />
        ) : (
          imageSrc && (
            <Image
              alt="Generated Image"
              className="w-full h-full object-cover rounded-lg shadow-lg"
              src={imageSrc}
              width={1024}
              height={1024}
            />
          )
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            placeholder="Describe the image"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate
          </button>
        </div>
      </form>
    </div>
  );
}
