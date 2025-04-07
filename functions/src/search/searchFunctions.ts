import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Registry } from '@genkit-ai/core';
import { generate, embed } from '@genkit-ai/ai';
import { googleAI, textEmbedding004 } from '@genkit-ai/googleai';

// Create a shared registry for better performance across function invocations
const globalRegistry = new Registry();
globalRegistry.apiStability = "stable";
globalRegistry.registerPluginProvider('googleai', googleAI());

// Generate embeddings for course content
export const generateCourseEmbeddings = functions.firestore
    .onDocumentWritten('courses/{courseId}',
    async (event) => {
        const change = event.data;
        const context = event.params;
        // Skip if document was deleted
        if (!change.after.exists) return null;
        
        const courseData = change.after.data();
        try {
            // Generate embedding for course title and description
            const contentToEmbed = `${courseData.title} ${courseData.description}`;
            const embedding = await embed(globalRegistry, {
                embedder: textEmbedding004,
                text: contentToEmbed
            });
            
            // Store the embedding with the course document
            await change.after.ref.update({
                embedding: embedding.values,
                embeddingUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            functions.logger.info(`Generated embedding for course ${context.courseId}`);
            return null;

        } catch (error) {
            functions.logger.error(`Error generating embedding for ${context.params.courseId}:`, error);
            return null;
        }
    });

// Search courses by semantic similarity
export const searchCoursesByVector = functions.https.onCall(async (data, context) => {
    try {
        // Authenticate the request
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated to search courses'
            );
        }
        
        const { query, limit = 10, filters = {} } = data;
        
        // Generate embedding for the search query
        const queryEmbedding = await embed(globalRegistry, {
            embedder: textEmbedding004,
            text: query
        });
        
        // Build the query with any additional filters
        let coursesQuery = admin.firestore().collection('courses');
        
        // Apply any additional filters (difficulty, tags, etc.)
        Object.entries(filters).forEach(([field, value]) => {
            if (value !== undefined && value !== null) {
                coursesQuery = coursesQuery.where(field, '==', value);
            }
        });
        
        // Execute vector search
        const results = await coursesQuery
            .where('isPublished', '==', true)
            .findSimilar({
                embedding: queryEmbedding.values,
                dimension: 768,
                distance: 'cosine'
            })
            .limit(limit)
            .get();
        
        // Format and return results
        return results.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            similarity: doc.similarity
        }));
    } catch (error) {
        functions.logger.error('Error in vector search:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Error performing vector search',
            { originalError: error instanceof Error ? error.message : 'Unknown error' }
        );
    }
});

// Reindex all course content (admin function)
export const reindexAllCourses = functions.https.onCall(async (data, context) => {
    // Verify admin access
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated', 
            'User must be authenticated'
        );
    }
    
    try {
        // Check admin permissions
        const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
        const userData = userDoc.data();
        if (!userData?.isAdmin && !userData?.roles?.includes('admin')) {
            throw new functions.https.HttpsError(
                'permission-denied', 
                'Only administrators can reindex all content'
            );
        }
        
        const coursesSnapshot = await admin.firestore().collection('courses').get();
        const batch = admin.firestore().batch();
        let count = 0;
        
        for (const doc of coursesSnapshot.docs) {
            const courseData = doc.data();
            const contentToEmbed = `${courseData.title} ${courseData.description}`;
            
            try {
                const embedding = await embed(globalRegistry, {
                    embedder: textEmbedding004,
                    text: contentToEmbed
                });
                
                batch.update(doc.ref, {
                    embedding: embedding.values,
                    embeddingUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                count++;
                // Commit batches of 500 to avoid hitting limits
                if (count % 500 === 0) {
                    await batch.commit();
                }
            } catch (err) {
                functions.logger.error(`Error embedding course ${doc.id}:`, err);
            }
        }
        
        // Commit any remaining updates
        if (count % 500 !== 0) {
            await batch.commit();
        }
        
        return { success: true, indexedCount: count };
    } catch (error) {
        functions.logger.error('Error reindexing courses:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Error reindexing courses',
            { originalError: error instanceof Error ? error.message : 'Unknown error' }
        );
    }
});