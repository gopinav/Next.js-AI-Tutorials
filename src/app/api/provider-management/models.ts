import { anthropic } from "@ai-sdk/anthropic";
import { openai as originalOpenAI } from "@ai-sdk/openai";
import {
  createProviderRegistry,
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
} from "ai";

const customOpenAI = customProvider({
  languageModels: {
    fast: originalOpenAI("gpt-5-nano"),
    smart: originalOpenAI("gpt-5-mini"),
    reasoning: wrapLanguageModel({
      model: originalOpenAI("gpt-5-mini"),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: "high",
            },
          },
        },
      }),
    }),
  },
  fallbackProvider: originalOpenAI,
});

const customAnthropic = customProvider({
  languageModels: {
    fast: anthropic("claude-3-5-haiku-20241022"),
    smart: anthropic("claude-sonnet-4-20250514"),
  },
  fallbackProvider: anthropic,
});

export const registry = createProviderRegistry({
  openai: customOpenAI,
  anthropic: customAnthropic,
});
