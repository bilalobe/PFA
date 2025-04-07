import { Request, Response } from 'express';
import GoogleGenerativeAI from '@genkit-ai/googleai';
import * as functions from 'firebase-functions';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(functions.config().googleai?.apikey || process.env.GOOGLE_AI_API_KEY || '');

export interface ChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export async function chatCompletionHandler(req: Request, res: Response): Promise<void> {
  try {
    const { messages, maxTokens = 256, temperature = 0.7 } = req.body as ChatCompletionRequest;
    
    if (!messages || !messages.length) {
      res.status(400).json({ error: 'Messages are required' });
      return;
    }

    // Get the chat model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      }
    });
    
    // Process each message in the history
    let response;
    for (const message of messages) {
      if (message.role === 'user') {
        response = await chat.sendMessage(message.content);
      }
    }

    if (!response) {
      res.status(400).json({ error: 'No valid user messages found' });
      return;
    }

    // Return the response
    res.status(200).json({
      result: response.text(),
      usage: {
        promptTokens: response.promptFeedback?.tokenCount || 0,
        totalTokens: response.promptFeedback?.tokenCount || 0,
      }
    });
  } catch (error) {
    console.error('Error in chat completion:', error);
    res.status(500).json({ 
      error: 'Failed to complete chat',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
