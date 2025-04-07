import { useState } from 'react';
import { functions } from '../firebaseConfig'; // Adjust path as needed
import { httpsCallable } from 'firebase/functions';
import { useAuth } from './useAuth'; // Assuming you have an auth hook

interface CourseRecommendation {
  courseId: string;
  title: string;
  relevanceScore: number;
  reasonForRecommendation: string;
}

interface RecommendationsResponse {
  recommendations: CourseRecommendation[];
  suggestedTopics: string[];
  learningPathSuggestion?: string;
}

interface RecommendationOptions {
  interests?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  previousCourses?: string[];
  limit?: number;
  userId?: string; // Only for admins/teachers
}

export function useAIRecommendations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const { user } = useAuth();

  const getRecommendations = async (options: RecommendationOptions = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const getRecommendedCourses = httpsCallable<RecommendationOptions, RecommendationsResponse>(
        functions, 
        'getRecommendedCourses'
      );
      
      const result = await getRecommendedCourses({
        userId: options.userId, // Only respected if user has admin/teacher role
        interests: options.interests,
        skillLevel: options.skillLevel,
        previousCourses: options.previousCourses,
        limit: options.limit || 5
      });
      
      setRecommendations(result.data);
      return result.data;
    } catch (err: any) {
      const message = err.message || 'Failed to get recommendations';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    getRecommendations,
    recommendations,
    loading,
    error
  };
}