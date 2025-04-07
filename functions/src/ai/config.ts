import * as functions from 'firebase-functions';

export const aiConfig = {
  gemini: {
    apiKey: functions.config().googleai?.apikey || process.env.GOOGLE_AI_API_KEY || '',
    defaultModel: 'gemini-pro',
    visionModel: 'gemini-pro-vision',
    defaultTemperature: 0.7,
    maxOutputTokens: 2048,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  contextWindow: {
    maxMessagesInHistory: 10,
    maxMessageAge: 60 * 60 * 1000, // 1 hour
  },
  embeddings: {
    vectorDimensions: 768,
    model: 'textembedding-gecko@003',
  },
};