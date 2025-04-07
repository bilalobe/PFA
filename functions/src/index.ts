import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { aiRouter, courseRecommendationFlow, studyTopicFlow } from './ai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';

// Initialize Firebase
admin.initializeApp();

// Export the AI functions
export const ai = functions.https.onRequest(aiRouter);

// Initialize telemetry with proper error handling
try {
  enableFirebaseTelemetry({
    projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  }).catch((error) => {
    console.error("[TELEMETRY] Initialization error:", error);
  });
} catch (err) {
  console.warn("[TELEMETRY] Setup error:", err);
}

// Export all functions from their respective modules
export * from './auth/handlers';
export * from './auth/auth';
export * from './ai/sentiment';
export * from './courses/contentGeneration';
export * from './courses/triggers';
export * from './integrity/plagiarismDetection';
export * from './integrity/contentModeration';
export * from './liveSession/sessionManagement';
export * from './liveSession/webSocketHandler'; // Added WebSocket handler
export * from './notifications/callable';
export * from './notifications/scheduled';
export * from './notifications/triggers';
export * from './notifications/handlers';
export * from './notifications/emailTemplates';
export * from './recommendations/contentRecommendation';
export * from './recommendations/learningPath';
export * from './recommendations/studyTopics';
export * from './recommendations/compute';
export * from './recommendations/feedback';
export * from './recommendations/handlers';
export * from './search/exports';
export * from './search/vectorSearch';
export * from './utils/helpers';