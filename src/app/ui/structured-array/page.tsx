"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { pokemonUISchema } from "@/app/api/structured-array/schema";
import { useState } from "react";

export default function StructuredArrayPage() {
  const [type, setType] = useState("");
  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/structured-array",
    schema: pokemonUISchema,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ type });
    setType("");
  };

  return (
    <div className="flex flex-col w-full max-w-2xl pt-12 pb-24 mx-auto">
      {error && <div className="text-red-500 mb-4 px-4">{error.message}</div>}

      <div className="space-y-8">
        {object?.map((pokemon) => (
          <div
            key={pokemon?.name}
            className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-lg shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-4">{pokemon?.name}</h2>
            <div className="grid grid-cols-2 gap-4">
              {pokemon?.abilities?.map((ability) => (
                <div
                  key={ability}
                  className="bg-zinc-100 dark:bg-zinc-700 p-3 rounded-md"
                >
                  {ability}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-2xl mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Enter a type..."
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !type.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
