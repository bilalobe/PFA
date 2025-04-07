import * as express from 'express';
import { textGenerationHandler } from './textGeneration';
import { chatCompletionHandler } from './chatCompletion';
import { imageGenerationHandler } from './imageGeneration';
import { sentimentAnalysisHandler } from './sentiment';
import { initializeFlows } from './flows';
import { Registry } from '@genkit-ai/core/registry';
import { gemini15Pro } from '@genkit-ai/googleai';

// Create a registry
const registry = new Registry();

// Initialize flows
const flows = initializeFlows(registry);

// Set up express router
const router = express.Router();

// Define AI API routes
router.post('/generate-text', textGenerationHandler);
router.post('/chat', chatCompletionHandler);
router.post('/generate-image', imageGenerationHandler);
router.post('/analyze-sentiment', sentimentAnalysisHandler);

// Export the router and flows
export const aiRouter = router;
export const courseRecommendationFlow = flows.courseRecommendationFlow;
export const studyTopicFlow = flows.studyTopicFlow;

// Export other utilities
export * from './utils';
