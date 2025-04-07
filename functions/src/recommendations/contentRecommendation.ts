import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { vertexai } from '@firebase/vertexai';

/**
 * Smart content recommendation system that analyzes user behavior and suggests
 * relevant content from courses, articles, videos, and exercises.
 */

interface UserActivity {
  watched: string[];
  completed: string[];
  saved: string[];
  searched: string[];
  timeSpent: Record<string, number>;
}

interface RecommendationOptions {
  count?: number;
  includeTypes?: Array<'course' | 'video' | 'article' | 'quiz' | 'exercise'>;
  difficulty?: 'all' | 'easier' | 'similar' | 'harder';
}

/**
 * Fetch user activity data from various collections
 */
async function getUserActivityData(userId: string): Promise<UserActivity> {
  // Initialize activity object
  const activity: UserActivity = {
    watched: [],
    completed: [],
    saved: [],
    searched: [],
    timeSpent: {},
  };
  
  // Get course enrollments
  const enrollments = await admin.firestore()
    .collection('enrollments')
    .where('userId', '==', userId)
    .get();
    
  // Get user watch history
  const watchHistory = await admin.firestore()
    .collection('watchHistory')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(50)
    .get();
    
  // Get saved items
  const savedItems = await admin.firestore()
    .collection('savedItems')
    .where('userId', '==', userId)
    .get();
    
  // Get search history
  const searchHistory = await admin.firestore()
    .collection('searchHistory')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(20)
    .get();
    
  // Process enrollments
  enrollments.forEach(doc => {
    const data = doc.data();
    if (data.completionRate === 100) {
      activity.completed.push(data.courseId);
    }
    
    if (data.timeSpent) {
      activity.timeSpent[data.courseId] = data.timeSpent;
    }
  });
  
  // Process watch history
  watchHistory.forEach(doc => {
    const data = doc.data();
    activity.watched.push(data.contentId);
  });
  
  // Process saved items
  savedItems.forEach(doc => {
    const data = doc.data();
    activity.saved.push(data.itemId);
  });
  
  // Process search history
  searchHistory.forEach(doc => {
    const data = doc.data();
    activity.searched.push(data.query);
  });
  
  return activity;
}

/**
 * Fetch content metadata for embedding generation
 */
async function getContentMetadata(contentIds: string[]): Promise<Record<string, any>> {
  const contentMap: Record<string, any> = {};
  
  // Batch fetch courses
  const courseRefs = contentIds.map(id => 
    admin.firestore().collection('courses').doc(id)
  );
  
  // Execute in batches of 10
  for (let i = 0; i < courseRefs.length; i += 10) {
    const batch = courseRefs.slice(i, i + 10);
    const results = await Promise.all(batch.map(ref => ref.get()));
    
    results.forEach(doc => {
      if (doc.exists) {
        contentMap[doc.id] = doc.data();
        contentMap[doc.id].type = 'course';
      }
    });
  }
  
  // Also check videos collection
  const videoRefs = contentIds.map(id => 
    admin.firestore().collection('videos').doc(id)
  );
  
  for (let i = 0; i < videoRefs.length; i += 10) {
    const batch = videoRefs.slice(i, i + 10);
    const results = await Promise.all(batch.map(ref => ref.get()));
    
    results.forEach(doc => {
      if (doc.exists) {
        contentMap[doc.id] = doc.data();
        contentMap[doc.id].type = 'video';
      }
    });
  }
  
  return contentMap;
}

/**
 * Generate content recommendations using VertexAI
 */
export const getPersonalizedRecommendations = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'You must be logged in to get recommendations'
    );
  }
  
  const userId = context.auth.uid;
  const options: RecommendationOptions = data?.options || {
    count: 10,
    includeTypes: ['course', 'video', 'article', 'quiz'],
    difficulty: 'similar'
  };
  
  try {
    // Get user activity and profile data
    const [activity, userProfile] = await Promise.all([
      getUserActivityData(userId),
      admin.firestore().collection('userProfiles').doc(userId).get()
    ]);
    
    const userData = userProfile.exists ? userProfile.data() : {};
    
    // Get content metadata for items the user has interacted with
    const interactedContentIds = [
      ...activity.watched,
      ...activity.completed,
      ...activity.saved
    ];
    
    const contentMap = await getContentMetadata(interactedContentIds);
    
    // Initialize VertexAI
    const vertexAI = vertexai(admin.app());
    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      }
    });
    
    // Create a context for the AI model
    const userPreferences = userData.preferences || {};
    const userInterests = userData.interests || [];
    const userSkillLevel = userData.skillLevel || 'beginner';
    
    // Create descriptions of user's watched content
    const watchedContentDescriptions = activity.watched
      .filter(id => contentMap[id])
      .map(id => {
        const content = contentMap[id];
        return `${content.title} (${content.type}): ${content.description?.substring(0, 100) || 'No description'}`;
      })
      .slice(0, 5) // Limit to most recent 5 for brevity
      .join('\n');
    
    // Create descriptions of user's completed content
    const completedContentDescriptions = activity.completed
      .filter(id => contentMap[id])
      .map(id => {
        const content = contentMap[id];
        return `${content.title} (${content.type}): ${content.description?.substring(0, 100) || 'No description'}`;
      })
      .join('\n');
    
    // Build prompt for recommendation
    const prompt = `You are an expert educational content recommendation system. Generate personalized content recommendations based on the following user information:

User Skill Level: ${userSkillLevel}
User Interests: ${userInterests.join(', ')}
User Preferences: ${Object.entries(userPreferences).map(([k, v]) => `${k}: ${v}`).join(', ')}

Recently Watched Content:
${watchedContentDescriptions || 'None'}

Completed Content:
${completedContentDescriptions || 'None'}

Search Keywords:
${activity.searched.slice(0, 10).join(', ')}

Generate ${options.count || 10} recommendations that would be most relevant for this user. Include various types of content: ${options.includeTypes?.join(', ') || 'course, video, article, quiz'}. The difficulty should be ${options.difficulty || 'similar'} to what they've completed.

For each recommendation, provide:
1. Title
2. Type (course, video, article, quiz, or exercise)
3. Brief description
4. Estimated difficulty level (beginner, intermediate, advanced)
5. Keywords/tags
6. Why you're recommending it based on their history

Format the response as JSON like this:
\`\`\`json
{
  "recommendations": [
    {
      "title": "Title of recommendation",
      "type": "course",
      "description": "Brief description",
      "difficulty": "beginner",
      "tags": ["keyword1", "keyword2"],
      "reason": "Why this is recommended"
    }
  ]
}
\`\`\``;

    // Generate recommendations
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    
    const responseText = result.response.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                      responseText.match(/\{[\s\S]*\}/);
                      
    if (!jsonMatch) {
      throw new Error("Failed to extract valid JSON from model response");
    }
    
    let recommendations;
    try {
      recommendations = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
    } catch (e) {
      throw new Error(`Failed to parse recommendations JSON: ${e.message}`);
    }
    
    // Store the recommendations for future reference
    await admin.firestore().collection('userRecommendations').doc(userId).set({
      recommendations: recommendations.recommendations,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      options
    });
    
    return recommendations;
    
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate personalized recommendations',
      error.message
    );
  }
});

/**
 * Scheduled function to update recommendations for active users
 */
export const updateRecommendationsScheduled = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    // Get active users from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const activeUsers = await admin.firestore()
      .collection('userActivity')
      .where('lastActive', '>', oneWeekAgo)
      .limit(100) // Process in batches
      .get();
      
    // Process each active user
    const updatePromises = [];
    
    activeUsers.forEach(doc => {
      const userId = doc.id;
      
      // Create a background task to update recommendations
      const task = admin.firestore().collection('tasks').add({
        type: 'updateRecommendations',
        userId,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      updatePromises.push(task);
    });
    
    await Promise.all(updatePromises);
    
    return null;
  });