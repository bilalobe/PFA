import * as functions from 'firebase-functions';
import { db, admin } from '../firebaseConfig';
import { Registry } from '@genkit-ai/core';
import { generate } from '@genkit-ai/ai';
import { gemini15Pro } from '@genkit-ai/googleai';

// Initialize global registry
const globalRegistry = new Registry();

/**
 * Generates personalized learning path recommendations based on student progress,
 * goals, and learning patterns.
 */
export const generateLearningPathRecommendations = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    const userId = context.auth.uid;
    const { goal, timeFrame, preferredSubjects } = data;
    
    // Fetch user's current enrollments and progress
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('studentId', '==', userId)
      .get();
    
    const enrollments = [];
    for (const doc of enrollmentsSnapshot.docs) {
      const enrollmentData = doc.data();
      
      // Get course details for each enrollment
      const courseRef = await db.collection('courses').doc(enrollmentData.courseId).get();
      if (courseRef.exists) {
        enrollments.push({
          courseId: enrollmentData.courseId,
          progress: enrollmentData.progress || 0,
          completedModules: enrollmentData.completedModules || [],
          completed: enrollmentData.completed || false,
          courseTitle: courseRef.data()?.title || 'Unknown Course',
          courseTags: courseRef.data()?.tags || [],
          difficulty: courseRef.data()?.difficulty || 'intermediate'
        });
      }
    }
    
    // Fetch assessment scores to understand strengths/weaknesses
    const assessmentsSnapshot = await db.collection('assessments')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .limit(20)
      .get();
    
    const assessments = assessmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Fetch activity history
    const activitySnapshot = await db.collection('userActivity')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const activities = activitySnapshot.docs.map(doc => doc.data());
    
    // Get available courses that user hasn't enrolled in
    const allCoursesSnapshot = await db.collection('courses')
      .where('isPublished', '==', true)
      .get();
    
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    
    const availableCourses = allCoursesSnapshot.docs
      .filter(doc => !enrolledCourseIds.includes(doc.id))
      .map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        tags: doc.data().tags || [],
        difficulty: doc.data().difficulty || 'intermediate',
        duration: doc.data().duration || 0,
        rating: doc.data().rating || 0
      }));
    
    // Use AI to generate personalized recommendations
    const response = await generate(globalRegistry, {
      model: gemini15Pro,
      prompt: [
        `As an educational AI advisor, create a personalized learning path for a student based on their learning history, current progress, and stated goals.
        
        STUDENT INFORMATION:
        - Goal: ${goal || 'Not specified'}
        - Preferred subjects: ${preferredSubjects?.join(', ') || 'Not specified'}
        - Timeframe: ${timeFrame || 'Not specified'}
        
        CURRENT ENROLLMENTS AND PROGRESS:
        ${JSON.stringify(enrollments, null, 2)}
        
        RECENT ASSESSMENT PERFORMANCE:
        ${JSON.stringify(assessments.slice(0, 5), null, 2)}
        
        LEARNING ACTIVITY PATTERNS:
        ${JSON.stringify(activities.slice(0, 10), null, 2)}
        
        AVAILABLE COURSES FOR RECOMMENDATION:
        ${JSON.stringify(availableCourses.slice(0, 20), null, 2)}
        
        Based on this information, please provide:
        1. A personalized learning pathway with 3-5 recommended next courses from the available courses list
        2. For each recommendation, explain why it's suitable based on the student's history and goals
        3. Suggest an optimal order and timeline for taking these courses
        4. Include specific modules or topics from current enrollments the student should focus on completing
        
        Format your response as a JSON object with these keys:
        - recommendedCourses: Array of {courseId, title, reasoning, priority}
        - focusAreas: Array of {courseId, moduleId, topic, reasoning}
        - timeline: General schedule suggestion
        - overallStrategy: Brief explanation of the recommendation strategy`
      ],
      config: {
        temperature: 0.2,
        maxOutputTokens: 1024
      }
    });

    // Extract the recommendations
    const recommendations = response.text;
    
    try {
      // Parse the JSON response
      const parsedRecommendations = JSON.parse(recommendations);
      
      // Store the recommendations
      await db.collection('users').doc(userId).collection('recommendations').add({
        type: 'learningPath',
        recommendations: parsedRecommendations,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        goal,
        timeFrame,
        preferredSubjects
      });
      
      return parsedRecommendations;
    } catch (parseError) {
      console.error('Error parsing AI recommendations:', parseError);
      // Handle malformed response gracefully
      return { 
        error: 'Could not generate structured recommendations',
        rawResponse: recommendations
      };
    }
    
  } catch (error) {
    console.error('Error generating learning path recommendations:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate recommendations');
  }
});

/**
 * Scheduled function that runs weekly to update learning path recommendations
 * for active users
 */
export const updateWeeklyRecommendations = functions.pubsub
  .schedule('every monday 08:00')
  .onRun(async (context) => {
    try {
      // Get active users who have logged in within the last 30 days
      const thirtyDaysAgo = admin.firestore.Timestamp.fromMillis(
        Date.now() - (30 * 24 * 60 * 60 * 1000)
      );
      
      const activeUsersSnapshot = await db.collection('users')
        .where('lastLogin', '>=', thirtyDaysAgo)
        .get();
      
      console.log(`Generating weekly recommendations for ${activeUsersSnapshot.size} active users`);
      
      // Process in batches to avoid overloading
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < activeUsersSnapshot.size; i += batchSize) {
        const batch = activeUsersSnapshot.docs.slice(i, i + batchSize);
        batches.push(batch);
      }
      
      for (const userBatch of batches) {
        const promises = userBatch.map(async (userDoc) => {
          const userId = userDoc.id;
          
          try {
            // Get user's learning goals from profile
            const userProfile = userDoc.data();
            const learningGoals = userProfile?.learningGoals || [];
            const preferredSubjects = userProfile?.interests || [];
            
            // Generate recommendations for this user
            await generateLearningPathRecommendations({
              goal: learningGoals[0] || "Professional development",
              preferredSubjects,
              timeFrame: "3 months"
            }, { auth: { uid: userId } });
            
          } catch (userError) {
            console.error(`Error generating recommendations for user ${userId}:`, userError);
          }
        });
        
        // Wait for this batch to complete before processing the next
        await Promise.allSettled(promises);
      }
      
      return null;
    } catch (error) {
      console.error('Error in weekly recommendation updates:', error);
      return null;
    }
  });