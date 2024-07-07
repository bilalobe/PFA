import {generate} from "@genkit-ai/ai";
import {configureGenkit} from "@genkit-ai/core";
import {firebaseAuth} from "@genkit-ai/firebase/auth";
import {onFlow} from "@genkit-ai/firebase/functions";
import {geminiPro} from "@genkit-ai/googleai";
import * as z from "zod";
import {firebase} from "@genkit-ai/firebase";
import {googleAI} from "@genkit-ai/googleai";

configureGenkit({
  plugins: [firebase(), googleAI()],
  logLevel: "debug",
  enableTracingAndMetrics: true,
});

export const menuSuggestionFlow = onFlow(
    {
      name: "menuSuggestionFlow",
      inputSchema: z.object({ 
          theme: z.string()
      }), 
      outputSchema: z.string(),
      authPolicy: firebaseAuth((user) => {
        // ... Firebase Auth is required 
        // ... add custom auth logic here if needed 
      }),
    },
    async (input) => {
        const { theme } = input;
        const prompt = `Suggest an item for the menu of a ${theme} themed restaurant`;

        const llmResponse = await generate({
          model: geminiPro,
          prompt: prompt,
          config: {
            temperature: 1,
          },
        });
    
        return llmResponse.text(); 
    }
  );