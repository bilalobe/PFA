import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import GoogleGenerativeAI from '@genkit-ai/googleai';
import { aiConfig } from '../config';

const genAI = new GoogleGenerativeAI(aiConfig.gemini.apiKey);

export async function createCourseEmbeddings(courseId: string): Promise<void> {
  try {
    const courseRef = admin.firestore().collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists) {
      throw new Error(`Course ${courseId} not found`);
    }
    
    const courseData = courseDoc.data();
    
    // Create embeddings for course title and description
    const textToEmbed = `${courseData?.title} ${courseData?.description}`;
    
    // Get the embedding model
    const embedder = genAI.getEmbedding();
    const result = await embedder.embedContent({
      content: [{ text: textToEmbed }],
    });

    // Store embeddings in Firestore
    await courseRef.update({
      embeddings: result.embedding.values,
      embeddingsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    functions.logger.info(`Created embeddings for course ${courseId}`);
  } catch (error) {
    functions.logger.error(`Error creating embeddings for course ${courseId}:`, error);
    throw error;
  }
}

// This function can be triggered when course content changes
export const generateCourseEmbeddings = functions.firestore
  .document('courses/{courseId}')
  .onWrite(async (change, context) => {
    const courseId = context.params.courseId;
    
    // Only update embeddings if content has changed
    if (change.before.exists && change.after.exists) {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      
      if (beforeData.title === afterData.title && 
          beforeData.description === afterData.description) {
        return null;
      }
    }
    
    await createCourseEmbeddings(courseId);
    return null;
  });