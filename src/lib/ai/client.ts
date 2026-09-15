import Anthropic from "@anthropic-ai/sdk";

let cachedClient: Anthropic | null = null;

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropicClient(): Anthropic {
  if (!isAiConfigured()) {
    throw new Error("ANTHROPIC_API_KEY no está configurada.");
  }
  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cachedClient;
}

export const AI_MODEL = "claude-sonnet-5";
