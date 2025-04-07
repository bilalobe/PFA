import { Request, Response } from 'express';
import GoogleGenerativeAI from '@genkit-ai/googleai';
import * as functions from 'firebase-functions';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(functions.config().googleai?.apikey || process.env.GOOGLE_AI_API_KEY || '');

export interface TextGenerationRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function textGenerationHandler(req: Request, res: Response): Promise<void> {
  try {
    const { prompt, maxTokens = 256, temperature = 0.7 } = req.body as TextGenerationRequest;
    
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      }
    });

    // Extract and return the response
    const response = result.response;
    res.status(200).json({
      result: response.text(),
      usage: {
        promptTokens: response.promptFeedback?.tokenCount || 0,
        totalTokens: response.promptFeedback?.tokenCount || 0,
      }
    });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ 
      error: 'Failed to generate text',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
