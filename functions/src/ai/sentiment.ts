import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generate } from "@genkit-ai/ai";
import { gemini15Pro } from "@genkit-ai/googleai";
import { Registry } from "@genkit-ai/core/registry";

const globalRegistry = new Registry();
globalRegistry.apiStability = "stable";

export const analyzeSentiment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Must be authenticated to analyze sentiment'
        );
    }

    try {
        const { text } = data;
        if (!text || typeof text !== 'string') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Text must be a non-empty string'
            );
        }

        // Enhanced prompt for sentiment analysis
        const prompt = `Analyze the sentiment of the following text and categorize it as POSITIVE, NEGATIVE, or NEUTRAL. Also provide a confidence score between 0 and 1, and identify any concerning content that might require moderation.

Text to analyze: "${text}"

Please format your response exactly as follows:
SENTIMENT: [POSITIVE/NEGATIVE/NEUTRAL]
SCORE: [0.0-1.0]
REQUIRES_MODERATION: [true/false]
CONCERNS: [list any concerning content or "none" if none found]`;

        // Generate analysis with shared registry
        const llmResponse = await generate(
            globalRegistry,
            {
                model: gemini15Pro,
                prompt: prompt,
                config: {
                    temperature: 0.1, // Lower temperature for more consistent analysis
                    maxOutputTokens: 150,
                    topP: 0.9,
                }
            }
        );

        // Parse the response
        const lines = llmResponse.text.split('\n');
        const sentiment = lines.find(l => l.startsWith('SENTIMENT:'))?.split(':')[1]?.trim() || 'NEUTRAL';
        const score = parseFloat(lines.find(l => l.startsWith('SCORE:'))?.split(':')[1]?.trim() || '0.5');
        const requiresModeration = lines.find(l => l.startsWith('REQUIRES_MODERATION:'))?.split(':')[1]?.trim() === 'true';
        const concerns = lines.find(l => l.startsWith('CONCERNS:'))?.split(':')[1]?.trim() || 'none';

        // Log the analysis
        functions.logger.info('Sentiment analysis completed', {
            sentiment,
            score,
            requiresModeration,
            textLength: text.length,
            userId: context.auth.uid
        });

        // If moderation is required, create a moderation report
        if (requiresModeration) {
            await admin.firestore()
                .collection('moderationQueue')
                .add({
                    content: text,
                    userId: context.auth.uid,
                    sentiment,
                    score,
                    concerns,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'pending',
                    type: 'ai-flagged'
                });

            functions.logger.warn('Content flagged for moderation', {
                userId: context.auth.uid,
                concerns,
                sentiment,
                score
            });
        }

        return {
            sentiment,
            score,
            requiresModeration,
            concerns
        };

    } catch (error) {
        functions.logger.error('Error in sentiment analysis:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to analyze sentiment',
            { originalError: error instanceof Error ? error.message : 'Unknown error' }
        );
    }
});