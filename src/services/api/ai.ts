import { getFunctions, httpsCallable } from "firebase/functions";
import { handleApiError } from "../utils/errorHandling";

export const aiApi = {
  getSentiment: async (text: string) => {
    try {
      const functions = getFunctions();
      const analyzeSentiment = httpsCallable(functions, 'analyzeSentiment');
      const response = await analyzeSentiment({ text });

      if (response.data && typeof response.data === 'object' && 'sentiment' in response.data) {
        return { sentiment: response.data.sentiment };
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      handleApiError(error, 'Failed to analyze sentiment.');
      throw error;
    }
  },

  getChatbotResponse: async (userInput: string) => {
    try {
      const response = await fetch('/api/chat/askGemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      handleApiError(error, 'Failed to fetch chatbot response');
      throw error;
    }
  }
};