import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, List, ListItem, Divider, Skeleton, Alert, Button } from '@mui/material';
import { useAIRecommendations } from '../../hooks/useAIRecommendations';
import { useRouter } from 'next/navigation';
import { RecommendOutlined, StarRate, School } from '@mui/icons-material';

interface CourseRecommendationsProps {
  userId?: string; // Optional, defaults to current user
  limit?: number;
  showReasons?: boolean;
  showTopics?: boolean;
  showLearningPath?: boolean;
}

export default function CourseRecommendations({
  userId,
  limit = 3,
  showReasons = true,
  showTopics = true,
  showLearningPath = true
}: CourseRecommendationsProps) {
  const { getRecommendations, recommendations, loading, error } = useAIRecommendations();
  const router = useRouter();
  
  useEffect(() => {
    // Fetch recommendations on component mount
    getRecommendations({ userId, limit });
  }, [userId, limit]);
  
  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };
  
  if (loading) {
    return (
      <Box sx={{ maxWidth: '100%', mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <RecommendOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
          Recommended for You
        </Typography>
        {[...Array(limit)].map((_, i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="90%" height={20} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Failed to load recommendations: {error}
      </Alert>
    );
  }
  
  if (!recommendations || recommendations.recommendations.length === 0) {
    return null; // Don't show anything if no recommendations
  }
  
  return (
    <Box sx={{ maxWidth: '100%', mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        <RecommendationOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
        Recommended for You
      </Typography>
      
      {/* Course Recommendations */}
      {recommendations.recommendations.map((course) => (
        <Card key={course.courseId} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => handleCourseClick(course.courseId)}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{course.title}</Typography>
              <Chip 
                icon={<StarRate />} 
                label={`${course.relevanceScore}% Match`} 
                color={course.relevanceScore > 80 ? "success" : "primary"} 
                size="small" 
              />
            </Box>
            
            {showReasons && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {course.reasonForRecommendation}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Suggested Topics */}
      {showTopics && recommendations.suggestedTopics && recommendations.suggestedTopics.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle1">
            <School sx={{ mr: 1, verticalAlign: 'middle' }} />
            Topics to Explore
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {recommendations.suggestedTopics.map((topic, index) => (
              <Chip key={index} label={topic} variant="outlined" />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Learning Path Suggestion */}
      {showLearningPath && recommendations.learningPathSuggestion && (
        <Box mt={3} p={2} sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed' }}>
          <Typography variant="subtitle1">Suggested Learning Path:</Typography>
          <Typography variant="body2">{recommendations.learningPathSuggestion}</Typography>
        </Box>
      )}
      
      <Button fullWidth variant="text" sx={{ mt: 2 }} onClick={() => getRecommendations({ userId, limit })}>
        Refresh Recommendations
      </Button>
    </Box>
  );
}