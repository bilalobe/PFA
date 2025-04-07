import { Request, Response } from 'express';
import * as functions from 'firebase-functions';
import GoogleGenerativeAI from '@genkit-ai/googleai';
import * as admin from 'firebase-admin';
import { aiConfig } from '../config';

const genAI = new GoogleGenerativeAI(aiConfig.gemini.apiKey);

export async function contentPersonalizationHandler(req: Request, res: Response): Promise<void> {
  try {
    // Get authenticated user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Fetch user's learning history and preferences
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    // Fetch relevant courses based on user's learning path
    const coursesSnapshot = await admin.firestore()
      .collection('enrollments')
      .where('userId', '==', uid)
      .limit(5)
      .get();
    
    const enrolledCourses = coursesSnapshot.docs.map(doc => doc.data().courseId);
    
    // Create personalization prompt with user context
    const model = genAI.getGenerativeModel({ model: aiConfig.gemini.defaultModel });
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Create personalized learning recommendations for a student with these interests: 
          ${userData?.interests?.join(', ') || 'general education'}.
          They're currently enrolled in these courses: ${enrolledCourses.join(', ') || 'no courses yet'}.
          Their learning style preference is: ${userData?.learningStyle || 'visual'}.
          Suggest 3 specific topics they should focus on next to advance their skills.`
        }]
      }],
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.5,
      }
    });

    res.status(200).json({
      recommendations: result.response.text(),
      userId: uid,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating personalized content:', error);
    res.status(500).json({ 
      error: 'Failed to generate personalized content',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}