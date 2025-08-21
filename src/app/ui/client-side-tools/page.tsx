// app/ui/client-side-tools/page.tsx
"use client";

import { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { Image } from "@imagekit/next";
import type { ChatMessage } from "@/app/api/client-side-tools/route";

function buildTransformationUrl(
  baseUrl: string,
  transformation: string
): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}tr=${transformation}`;
}

export default function ClientSideToolsPage() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error, stop, addToolResult } =
    useChat<ChatMessage>({
      transport: new DefaultChatTransport({
        api: "/api/client-side-tools",
      }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      async onToolCall({ toolCall }) {
        if (toolCall.dynamic) {
          return;
        }
        switch (toolCall.toolName) {
          case "changeBackground":
            {
              const { imageUrl, backgroundPrompt } = toolCall.input;

              const transformation = `e-changebg-prompt-${backgroundPrompt}`;
              const transformedUrl = buildTransformationUrl(
                imageUrl,
                transformation
              );

              addToolResult({
                tool: "changeBackground",
                toolCallId: toolCall.toolCallId,
                output: transformedUrl,
              });
            }
            break;
          case "removeBackground":
            {
              const { imageUrl } = toolCall.input;

              const transformation = `e-removebg`;
              const transformedUrl = buildTransformationUrl(
                imageUrl,
                transformation
              );

              addToolResult({
                tool: "removeBackground",
                toolCallId: toolCall.toolCallId,
                output: transformedUrl,
              });
            }
            break;
        }
      },
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input, files });
    setInput("");
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md pt-12 pb-36 mx-auto stretch">
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
                    key={`${message.id}-${index}`}
                    className="whitespace-pre-wrap"
                  >
                    {part.text}
                  </div>
                );
              case "file":
                if (part.mediaType?.startsWith("image/")) {
                  return (
                    <Image
                      key={`${message.id}-${index}`}
                      src={part.url}
                      alt={part.filename ?? `attachment-${index}`}
                      width={500}
                      height={500}
                    />
                  );
                }
                if (part.mediaType?.startsWith("application/pdf")) {
                  return (
                    <iframe
                      key={`${message.id}-${index}`}
                      src={part.url}
                      width="500"
                      height="600"
                      title={part.filename ?? `attachment-${index}`}
                    />
                  );
                }
                return null;
              case "tool-generateImage":
                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div
                        key={`${message.id}-getWeather-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-500">
                          Receiving image generation request...
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
                          Generating image for: {part.input.prompt}
                        </div>
                      </div>
                    );

                  case "output-available":
                    return (
                      <div
                        key={`${message.id}-getWeather-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div>
                          <Image
                            urlEndpoint={
                              "https://ik.imagekit.io/codevolutionbus/"
                            }
                            src={`${part.output}`}
                            alt="Generated image"
                            width={500}
                            height={500}
                          />
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
              case "tool-changeBackground":
                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div
                        key={`${message.id}-getWeather-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-500">
                          Receiving image transformation request...
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
                          Changing background to: {part.input.backgroundPrompt}
                        </div>
                      </div>
                    );

                  case "output-available":
                    return (
                      <div
                        key={`${message.id}-getWeather-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div>
                          <Image
                            urlEndpoint={
                              "https://ik.imagekit.io/codevolutionbus/"
                            }
                            src={part.output}
                            alt="Generated image"
                            width={500}
                            height={500}
                          />
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
              case "tool-removeBackground":
                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div
                        key={`${message.id}-getWeather-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-500">
                          Receiving image transformation request...
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
                          Removing background...
                        </div>
                      </div>
                    );

                  case "output-available":
                    return (
                      <div
                        key={`${message.id}-getWeather-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div>
                          <Image
                            urlEndpoint={
                              "https://ik.imagekit.io/codevolutionbus/"
                            }
                            src={part.output}
                            alt="Generated image"
                            width={500}
                            height={500}
                          />
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
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              {files?.length
                ? `${files.length} file${files.length > 1 ? "s" : ""} attached`
                : "Attach files"}
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(event) => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              multiple
              ref={fileInputRef}
            />
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help you?"
            />
            {status === "submitted" || status === "streaming" ? (
              <button
                onClick={stop}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={status !== "ready"}
              >
                Send
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
