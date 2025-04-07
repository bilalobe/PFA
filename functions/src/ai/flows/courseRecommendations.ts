import { defineFlow } from "@genkit-ai/flow";
import { gemini15Pro } from "@genkit-ai/googleai";
import { z } from "zod";
import * as admin from 'firebase-admin';
import { generate } from "@genkit-ai/ai";

// Define the input schema
const inputSchema = z.object({
  userId: z.string().optional(),
  interests: z.array(z.string()).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  previousCourses: z.array(z.string()).optional(),
  limit: z.number().optional().default(5),
});

// Define the output schema
const outputSchema = z.object({
  recommendations: z.array(z.object({
    courseId: z.string(),
    title: z.string(),
    relevanceScore: z.number().min(0).max(100),
    reasonForRecommendation: z.string(),
  })),
  suggestedTopics: z.array(z.string()),
  learningPathSuggestion: z.string().optional(),
});

// Define the flow function
export const courseRecommendationFlowDefinition = {
  config: {
    name: 'courseRecommendationFlow',
    inputSchema,
    outputSchema,
    authPolicy: async (auth: any, input: z.infer<typeof inputSchema>) => {
      // If userId is provided, ensure the requester is either that user or an admin
      if (input.userId && auth?.uid !== input.userId) {
        const userDoc = await admin.firestore().collection('users').doc(auth?.uid).get();
        const userData = userDoc.data();
        
        if (!userData?.role || !['admin', 'teacher'].includes(userData.role)) {
          throw new Error('Unauthorized: Can only request recommendations for yourself unless you are an admin or teacher');
        }
      }
    }
  },
  steps: async (input: z.infer<typeof inputSchema>) => {
    // 1. Get user data if userId is provided but interests aren't
    let userInterests = input.interests || [];
    let previousCourseIds = input.previousCourses || [];
    let skillLevel = input.skillLevel || 'beginner';
    
    if (input.userId && (!input.interests || input.interests.length === 0)) {
      const userDoc = await admin.firestore().collection('users').doc(input.userId).get();
      const userData = userDoc.data();
      
      if (userData) {
        userInterests = userData.interests || [];
        skillLevel = userData.skillLevel || skillLevel;
        
        // Get user's enrolled courses
        const enrollmentsSnapshot = await admin.firestore()
          .collection('enrollments')
          .where('userId', '==', input.userId)
          .get();
          
        previousCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
      }
    }
    
    // 2. Get previous course details if any
    const previousCoursesData = [];
    if (previousCourseIds.length > 0) {
      for (const courseId of previousCourseIds) {
        const courseDoc = await admin.firestore().collection('courses').doc(courseId).get();
        if (courseDoc.exists) {
          previousCoursesData.push({
            id: courseDoc.id,
            title: courseDoc.data()?.title,
            topics: courseDoc.data()?.topics || [],
            category: courseDoc.data()?.category
          });
        }
      }
    }
    
    // 3. Get available courses excluding previous ones
    const availableCoursesSnapshot = await admin.firestore()
      .collection('courses')
      .where('status', '==', 'published')
      .get();
      
    const availableCourses = availableCoursesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        category: doc.data().category,
        topics: doc.data().topics || [],
        difficulty: doc.data().difficulty || 'beginner',
        rating: doc.data().averageRating || 0
      }))
      .filter(course => !previousCourseIds.includes(course.id));
    
    // 4. Generate AI-based recommendations
    const response = await generate({
      model: gemini15Pro,
      system: `You are an educational AI advisor for a personalized e-learning platform. 
              Your task is to recommend courses based on the user's interests, skill level, and learning history.
              Provide specific reasons for each recommendation.
              Focus on skill development and knowledge progression.`,
      prompt: `
        I need course recommendations for a user with the following profile:
        - Interests: ${userInterests.join(', ') || 'Not specified'}
        - Skill Level: ${skillLevel}
        - Previously Completed Courses: ${previousCoursesData.map(c => c.title).join(', ') || 'None'}
        
        Available courses to recommend from:
        ${availableCourses.map(course => 
          `- ID: ${course.id} | Title: ${course.title} | Category: ${course.category} | Topics: ${course.topics.join(', ')} | Difficulty: ${course.difficulty} | Rating: ${course.rating}`
        ).join('\n')}
        
        Please recommend up to ${input.limit} courses with relevance scores (0-100) and specific reasons for each recommendation.
        Also suggest 3-5 topics the user might want to explore next based on their profile.
        If appropriate, suggest a learning path that connects the recommended courses.
      `,
      output: {
        schema: z.object({
          recommendations: z.array(z.object({
            courseId: z.string(),
            relevanceScore: z.number().min(0).max(100),
            reasonForRecommendation: z.string()
          })),
          suggestedTopics: z.array(z.string()),
          learningPathSuggestion: z.string().optional()
        })
      }
    });

    // 5. Format the output
    const aiOutput = response.output;
    
    // Merge AI recommendations with course titles from our database
    const enhancedRecommendations = aiOutput.recommendations.map((rec: { courseId: string; relevanceScore: any; reasonForRecommendation: any; }) => {
      const course = availableCourses.find(c => c.id === rec.courseId);
      return {
        courseId: rec.courseId,
        title: course?.title || "Unknown Course",
        relevanceScore: rec.relevanceScore,
        reasonForRecommendation: rec.reasonForRecommendation
      };
    });

    return {
      recommendations: enhancedRecommendations,
      suggestedTopics: aiOutput.suggestedTopics,
      learningPathSuggestion: aiOutput.learningPathSuggestion
    };
  }
};