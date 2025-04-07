import * as functions from "firebase-functions";
import { generate } from "@genkit-ai/ai";
import { gemini15Pro } from "@genkit-ai/googleai";
import * as z from "zod";
import { Registry } from "@genkit-ai/core/registry";
import { parseAIResponse } from "../utils/helpers";

// Create a shared registry for better performance across function invocations
const globalRegistry = new Registry();
globalRegistry.apiStability = "stable";

// Define structured schemas with detailed descriptions
const StudyTopicInputSchema = z.object({
  subject: z.string().min(1).describe("Academic subject or field"),
  level: z.enum(["beginner", "intermediate", "advanced"])
    .optional()
    .describe("Student's knowledge level"),
});

const StudyTopicOutputSchema = z.object({
  topic: z.string().describe("Suggested study topic"),
  description: z.string().describe("Brief description of the topic"),
  resources: z.string().optional().describe("Suggested learning resources"),
});

// Study topic suggestion flow with improved structure
export const generateStudyTopicWithVertexAI = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Authentication required to access this function'
        );
    }
    
    const { subject } = data;
    const level = data.level || "intermediate";
    const requestId = generateRequestId();
    const requestTime = Date.now();
    
    try {
        // Enhanced prompt with better structure for parsing
        const prompt = `Generate a detailed study topic suggestion for ${subject} at a ${level} level.

Please format your response exactly as follows:
TOPIC: [specific topic name]
DESCRIPTION: [detailed explanation of the topic including key concepts]
RESOURCES: [recommended books, courses, websites, or tools for learning]

Make sure the topic is interesting, focused, and appropriate for a ${level} student.`;

        // Generate with the shared registry
        const llmResponse = await generate(
            globalRegistry,
            {
                model: gemini15Pro,
                prompt: prompt,
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 350,
                    topP: 0.8,
                }
            }
        );
        
        // Parse and validate response
        const parsedResponse = parseAIResponse(llmResponse.text);
        
        // Log success metrics
        functions.logger.info("Study topic generated successfully", {
            subject,
            level,
            requestId,
            processingTime: Date.now() - requestTime,
        });

        return parsedResponse;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        // Structured error logging
        functions.logger.error("Error in study topic suggestion:", {
            error: errorMessage,
            subject,
            level,
            requestId,
            processingTime: Date.now() - requestTime,
        });
        
        throw new functions.https.HttpsError(
            "internal",
            "Failed to generate study topic suggestion",
            { originalError: errorMessage }
        );
    }
});

// Helper function to generate a unique request ID
function generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}