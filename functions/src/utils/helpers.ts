import * as z from "zod";
import { StudyTopicOutputSchema } from "../recommendations/studyTopics";
import * as functions from '
import * as admin from '
import { z } from '
import { vertexai } from '

/**
 * Parse an AI response into a structured format
 */
export function parseAIResponse(text: string): z.infer<typeof StudyTopicOutputSchema> {
    // Enhanced regex patterns for more reliable extraction
    const topicMatch = text.match(/(?:TOPIC|Topic):\s*([^\n]+)/i);
    const descriptionMatch = text.match(/(?:DESCRIPTION|Description):\s*([\s\S]+?)(?=RESOURCES|Resources|$)/i);
    const resourcesMatch = text.match(/(?:RESOURCES|Resources):\s*([\s\S]+)$/i);
    
    const topic = topicMatch?.[1]?.trim() || "Study Topic";
    const description = descriptionMatch?.[1]?.trim() || "An interesting area of study";
    const resources = resourcesMatch?.[1]?.trim() || "Online courses and textbooks on the subject";
    
    return {
        topic,
        description,
        resources
    };
}

/**
 * Generate a unique request ID for tracking and debugging
 */
export function generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Check if a batch operation exceeds the maximum size
 */
export function validateBatchSize(items: any[], maxSize: number): void {
    if (items.length > maxSize) {
        throw new Error(`Batch size ${items.length} exceeds maximum of ${maxSize}`);
    }
}

/**
 * Process items in chunks for better reliability
 */
export function* chunkArray<T>(array: T[], size: number): Generator<T[]> {
    for (let i = 0; i < array.length; i += size) {
        yield array.slice(i, i + size);
    }
}

/**
 * Format a timestamp in a user-friendly way
 */
export function formatTimestamp(timestamp: FirebaseFirestore.Timestamp): string {
    return timestamp.toDate().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
    // Remove any potentially harmful characters or scripts
    return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Create a logger with context
 */
export function createContextLogger(context: { auth?: { uid: string } }, operation: string) {
    return {
        info: (message: string, data?: any) => {
            console.log(JSON.stringify({
                level: 'info',
                operation,
                userId: context.auth?.uid,
                message,
                data,
                timestamp: new Date().toISOString()
            }));
        },
        error: (message: string, error?: any) => {
            console.error(JSON.stringify({
                level: 'error',
                operation,
                userId: context.auth?.uid,
                message,
                error: error instanceof Error ? error.message : error,
                timestamp: new Date().toISOString()
            }));
        }
    };
}
