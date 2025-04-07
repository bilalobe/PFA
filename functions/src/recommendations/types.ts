export interface UserPreferences {
  interests: string[];
  skillLevel: "beginner" | "intermediate" | "advanced";
  preferredLanguages: string[];
  learningGoals: string[];
  availableTime?: {
    hoursPerWeek: number;
    preferredDays: string[];
  };
}

export interface ContentMetadata {
  id: string;
  type: "course" | "resource" | "forum" | "quiz";
  title: string;
  description: string;
  tags: string[];
  skillLevel: "beginner" | "intermediate" | "advanced";
  language: string;
  duration?: number;
  prerequisites?: string[];
  learningOutcomes?: string[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface UserInteraction {
  userId: string;
  itemId: string;
  itemType: "course" | "resource" | "forum" | "quiz";
  action: "view" | "complete" | "like" | "bookmark" | "enroll";
  timestamp: FirebaseFirestore.Timestamp;
  metadata?: {
    timeSpent?: number;
    progress?: number;
    rating?: number;
    feedback?: string;
  };
}

export interface RecommendationScore {
  itemId: string;
  score: number;
  type: string;
  matchReason: string[];
  metadata?: ContentMetadata;
}

export interface UserRecommendations {
  userId: string;
  recommendations: RecommendationScore[];
  generatedAt: FirebaseFirestore.Timestamp;
  isNew: boolean;
  metadata?: {
    interactionCount: number;
    lastInteractionDate: FirebaseFirestore.Timestamp;
    recommendationQuality?: number;
  };
}

export interface SimilarityScore {
  userId: string;
  similarity: number;
  commonInteractions: number;
  lastUpdated: FirebaseFirestore.Timestamp;
}

export interface RecommendationFeedback {
  userId: string;
  recommendationId: string;
  action: "click" | "ignore" | "dismiss" | "save";
  timestamp: FirebaseFirestore.Timestamp;
  feedback?: {
    relevant: boolean;
    reason?: string;
  };
}

export interface RecommendationMetrics {
  userId: string;
  period: "daily" | "weekly" | "monthly";
  startDate: FirebaseFirestore.Timestamp;
  endDate: FirebaseFirestore.Timestamp;
  metrics: {
    totalRecommendations: number;
    interactedRecommendations: number;
    clickThroughRate: number;
    averageRelevanceScore: number;
    conversionRate: number;
  };
}