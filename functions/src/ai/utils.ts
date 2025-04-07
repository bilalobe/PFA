import { Request } from 'express';
import { GenKit } from '@genkit-ai/core';
import { Flow } from '@genkit-ai/flow';

// Initialize GenKit
export const genkit = new GenKit();

/**
 * Validates an API key against the request
 */
export function validateApiKey(req: Request): boolean {
  const apiKey = req.headers['x-api-key'];
  // Implement your validation logic here
  return typeof apiKey === 'string' && apiKey.length > 0;
}

/**
 * Creates a flow from a specific prompt template
 */
export function createFlow(templateId: string): Flow {
  return Flow.fromTemplate(templateId);
}

/**
 * Processes text for AI consumption (sanitization, etc.)
 */
export function processInput(text: string): string {
  return text.trim();
}

/**
 * Extracts structured data from AI responses
 */
export function parseStructuredOutput<T>(output: string): T {
  try {
    return JSON.parse(output) as T;
  } catch (error) {
    throw new Error(`Failed to parse structured output: ${error instanceof Error ? error.message : String(error)}`);
  }
}
