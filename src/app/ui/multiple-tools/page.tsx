"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import type { ChatMessage } from "@/app/api/multiple-tools/route";

export default function MultipleToolsChatPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/multiple-tools",
    }),
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {error && <div className="text-red-500 mb-4">{error.message}</div>}

      {messages.map((message) => (
        <div key={message.id} className="mb-4">
          <div className="font-semibold">
            {message.role === "user" ? "You:" : "AI:"}
          </div>
          {message.parts.map((part, index) => {
            switch (part.type) {
              case "text":
                return (
                  <div
                    key={`${message.id}-text-${index}`}
                    className="whitespace-pre-wrap"
                  >
                    {part.text}
                  </div>
                );

              case "tool-getLocation":
                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div
                        key={`${message.id}-getLocation-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-500">
                          📍 Receiving location request...
                        </div>
                        <pre className="text-xs text-zinc-600 mt-1">
                          {JSON.stringify(part.input, null, 2)}
                        </pre>
                      </div>
                    );
                  case "input-available":
                    return (
                      <div
                        key={`${message.id}-getLocation-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-400">
                          📍 Getting location for {part.input.name}...
                        </div>
                      </div>
                    );

                  case "output-available":
                    return (
                      <div
                        key={`${message.id}-getLocation-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-400">
                          📍 Location found
                        </div>
                        <div className="text-sm text-zinc-300">
                          {part.output}
                        </div>
                      </div>
                    );

                  case "output-error":
                    return (
                      <div
                        key={`${message.id}-getLocation-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-red-400">
                          Error: {part.errorText}
                        </div>
                      </div>
                    );

                  default:
                    return null;
                }

              case "tool-getWeather":
                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div
                        key={`${message.id}-getWeather-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-500">
                          🌤️ Receiving weather request...
                        </div>
                        <pre className="text-xs text-zinc-600 mt-1">
                          {JSON.stringify(part.input, null, 2)}
                        </pre>
                      </div>
                    );
                  case "input-available":
                    return (
                      <div
                        key={`${message.id}-getWeather-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-400">
                          🌤️ Getting weather for {part.input.city}...
                        </div>
                      </div>
                    );

                  case "output-available":
                    return (
                      <div
                        key={`${message.id}-getWeather-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1"
                      >
                        <div className="text-sm text-zinc-400">🌤️ Weather</div>
                        <div className="text-sm text-zinc-300">
                          <div>{part.output}</div>
                        </div>
                      </div>
                    );

                  case "output-error":
                    return (
                      <div
                        key={`${message.id}-getWeather-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-red-400">
                          Error: {part.errorText}
                        </div>
                      </div>
                    );

                  default:
                    return null;
                }

              default:
                return null;
            }
          })}
        </div>
      ))}

      {(status === "submitted" || status === "streaming") && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How can I help you?"
            disabled={status !== "ready"}
          />
          {status === "submitted" || status === "streaming" ? (
            <button
              type="button"
              onClick={stop}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!input.trim()}
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
