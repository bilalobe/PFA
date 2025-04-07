import React from 'react';
import { Card, CardContent, Typography, Avatar, Box, Button, Divider, Chip } from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { Review } from '../../interfaces/types';
import Rating from './Rating';

interface ReviewCardProps {
  review: Review;
  onHelpfulClick?: (reviewId: string) => void;
  onReportClick?: (reviewId: string) => void;
  userHasMarkedHelpful?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  onHelpfulClick, 
  onReportClick,
  userHasMarkedHelpful = false
}) => {
  // Convert timestamp to formatted date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar 
            src={review.userPhotoURL || ''} 
            alt={review.userDisplayName || 'User'}
            sx={{ mr: 2 }}
          >
            {!review.userPhotoURL && (review.userDisplayName?.[0] || 'U')}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" component="div">
                {review.userDisplayName || 'Anonymous User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(review.dateCreated)}
              </Typography>
            </Box>
            
            <Rating value={review.rating} readOnly size="small" />
            
            {review.title && (
              <Typography variant="h6" component="h3" sx={{ mt: 1, fontSize: '1.1rem' }}>
                {review.title}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            mt: 2, 
            '& .ProseMirror-content': { 
              p: { mt: 0, mb: 2 }, 
              ul: { mt: 0, mb: 2 },
              ol: { mt: 0, mb: 2 },
            } 
          }}
          dangerouslySetInnerHTML={{ __html: review.content }}
        />
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              startIcon={userHasMarkedHelpful ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
              onClick={() => onHelpfulClick?.(review.id)}
              color={userHasMarkedHelpful ? 'primary' : 'inherit'}
              size="small"
            >
              Helpful {review.helpful && review.helpful > 0 ? `(${review.helpful})` : ''}
            </Button>
            
            <Button 
              startIcon={<FlagOutlinedIcon />}
              onClick={() => onReportClick?.(review.id)}
              color="inherit" 
              size="small"
              sx={{ ml: 1 }}
            >
              Report
            </Button>
          </Box>
          
          {review.reported && (
            <Chip 
              label="Reported" 
              size="small"
              color="warning"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;