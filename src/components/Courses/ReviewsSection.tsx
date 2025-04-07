import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, Button, CircularProgress, Paper, Grid, Tabs, Tab } from '@mui/material';
import { Timestamp, collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, getDoc, increment, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { Review } from '../../interfaces/types';
import ReviewForm from '../UI/ReviewForm';
import ReviewCard from '../UI/ReviewCard';
import Rating from '../UI/Rating';

interface RatingSummary {
  average: number;
  total: number;
  distribution: { [key in 1 | 2 | 3 | 4 | 5]: number };
}

interface ReviewsSectionProps {
  courseId: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [helpfulMarks, setHelpfulMarks] = useState<string[]>([]);
  const [ratingsSummary, setRatingsSummary] = useState<RatingSummary>({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Set sort based on tab
    switch (newValue) {
      case 0:
        setSortBy('newest');
        break;
      case 1:
        setSortBy('highest');
        break;
      case 2:
        setSortBy('lowest');
        break;
      case 3:
        setSortBy('helpful');
        break;
      default:
        setSortBy('newest');
    }
  };
  
  useEffect(() => {
    fetchReviews();
    if (user) {
      fetchUserHelpfulMarks();
    }
  }, [courseId, user, sortBy]);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create the query based on the sort
      let reviewsQuery = query(
        collection(db, 'reviews'),
        where('courseId', '==', courseId),
        where('approved', '==', true)
      );
      
      // Add ordering based on sort type
      switch (sortBy) {
        case 'newest':
          reviewsQuery = query(reviewsQuery, orderBy('dateCreated', 'desc'));
          break;
        case 'highest':
          reviewsQuery = query(reviewsQuery, orderBy('rating', 'desc'), orderBy('dateCreated', 'desc'));
          break;
        case 'lowest':
          reviewsQuery = query(reviewsQuery, orderBy('rating', 'asc'), orderBy('dateCreated', 'desc'));
          break;
        case 'helpful':
          reviewsQuery = query(reviewsQuery, orderBy('helpful', 'desc'), orderBy('dateCreated', 'desc'));
          break;
      }
      
      const querySnapshot = await getDocs(reviewsQuery);
      
      // Convert query snapshot to reviews array
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      // Process ratings for summary
      const summary = calculateRatingSummary(reviewsData);
      setRatingsSummary(summary);
      
      // Check if user has a review
      if (user) {
        const userReviewDoc = reviewsData.find(review => review.userId === user.uid);
        if (userReviewDoc) {
          setUserReview(userReviewDoc);
        } else {
          setUserReview(null);
        }
      }
      
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserHelpfulMarks = async () => {
    if (!user) return;
    
    try {
      const helpfulMarksRef = collection(db, 'helpfulMarks');
      const q = query(helpfulMarksRef, where('userId', '==', user.uid), where('courseId', '==', courseId));
      const querySnapshot = await getDocs(q);
      
      const marks = querySnapshot.docs.map(doc => doc.data().reviewId);
      setHelpfulMarks(marks);
    } catch (err) {
      console.error('Error fetching helpful marks:', err);
    }
  };
  
  const calculateRatingSummary = (reviewsData: Review[]): RatingSummary => {
    // Initialize distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    // Count reviews by rating
    reviewsData.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });
    
    // Calculate total and average
    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
    const average = total > 0 ? sum / total : 0;
    
    return {
      average,
      total,
      distribution
    };
  };
  
  const handleSubmitReview = async (reviewData: {
    courseId: string;
    userId: string;
    rating: number;
    title: string;
    content: string;
  }) => {
    try {
      // Check if user already has a review for this course
      if (userReview) {
        // Update existing review
        const reviewRef = doc(db, 'reviews', userReview.id);
        await updateDoc(reviewRef, {
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          dateUpdated: Timestamp.now()
        });
        
        // Refresh reviews to show update
        fetchReviews();
      } else {
        // Create new review
        const userDoc = await getDoc(doc(db, 'users', reviewData.userId));
        const userData = userDoc.data();
        
        const newReview = {
          ...reviewData,
          dateCreated: Timestamp.now(),
          helpful: 0,
          approved: true, // Auto-approve for now, but could require moderation
          reported: false,
          userDisplayName: userData?.displayName || 'Anonymous User',
          userPhotoURL: userData?.photoURL || ''
        };
        
        await addDoc(collection(db, 'reviews'), newReview);
        
        // Refresh reviews to include new review
        fetchReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };
  
  const handleHelpfulClick = async (reviewId: string) => {
    if (!user) return;
    
    try {
      const hasMarked = helpfulMarks.includes(reviewId);
      
      if (hasMarked) {
        // User already marked as helpful, so remove the mark
        const helpfulMarksRef = collection(db, 'helpfulMarks');
        const q = query(helpfulMarksRef, 
          where('userId', '==', user.uid), 
          where('reviewId', '==', reviewId)
        );
        
        const querySnapshot = await getDocs(q);
        
        // Delete the helpful mark
        if (!querySnapshot.empty) {
          await deleteDoc(querySnapshot.docs[0].ref);
        }
        
        // Decrement the helpful count on the review
        const reviewRef = doc(db, 'reviews', reviewId);
        await updateDoc(reviewRef, {
          helpful: increment(-1)
        });
        
        // Update local state
        setHelpfulMarks(helpfulMarks.filter(id => id !== reviewId));
      } else {
        // Add helpful mark
        const helpfulMarkData = {
          userId: user.uid,
          reviewId: reviewId,
          courseId: courseId,
          dateCreated: Timestamp.now()
        };
        
        await addDoc(collection(db, 'helpfulMarks'), helpfulMarkData);
        
        // Increment helpful count on the review
        const reviewRef = doc(db, 'reviews', reviewId);
        await updateDoc(reviewRef, {
          helpful: increment(1)
        });
        
        // Update local state
        setHelpfulMarks([...helpfulMarks, reviewId]);
      }
      
      // Refresh reviews to update the helpful count
      fetchReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };
  
  const handleReportClick = async (reviewId: string) => {
    if (!user) return;
    
    try {
      // Mark the review as reported
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        reported: true
      });
      
      // Add report to reports collection
      const reportData = {
        userId: user.uid,
        reviewId: reviewId,
        courseId: courseId,
        reason: 'inappropriate content', // This could be expanded to allow user to select reason
        dateCreated: Timestamp.now(),
        status: 'pending'
      };
      
      await addDoc(collection(db, 'reports'), reportData);
      
      // Refresh reviews
      fetchReviews();
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };
  
  // Calculate rating distribution percentages
  const calculatePercentage = (count: number) => {
    return ratingsSummary.total > 0 ? (count / ratingsSummary.total) * 100 : 0;
  };
  
  return (
    <Box sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Student Reviews & Ratings
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Grid container spacing={4}>
            {/* Rating summary */}
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h3" component="span" sx={{ fontWeight: 'bold', mr: 2 }}>
                    {ratingsSummary.average.toFixed(1)}
                  </Typography>
                  <Box>
                    <Rating 
                      value={ratingsSummary.average} 
                      readOnly 
                      precision={0.5}
                      size="medium"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {ratingsSummary.total} {ratingsSummary.total === 1 ? 'review' : 'reviews'}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Rating distribution */}
                {[5, 4, 3, 2, 1].map(rating => (
                  <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 15, mr: 1 }}>
                      {rating}
                    </Typography>
                    <Box sx={{ 
                      flexGrow: 1, 
                      height: 8, 
                      bgcolor: '#eee',
                      borderRadius: 1,
                      mr: 1,
                      overflow: 'hidden'
                    }}>
                      <Box 
                        sx={{ 
                          width: `${calculatePercentage(ratingsSummary.distribution[rating])}%`, 
                          height: '100%', 
                          bgcolor: 'primary.main',
                          borderRadius: 1,
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 30 }}>
                      {ratingsSummary.distribution[rating]}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
            
            {/* Reviews list */}
            <Grid item xs={12} md={8}>
              {/* Filter tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Most Recent" />
                  <Tab label="Highest Rated" />
                  <Tab label="Lowest Rated" />
                  <Tab label="Most Helpful" />
                </Tabs>
              </Box>
              
              {/* Reviews list */}
              {reviews.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ my: 4, textAlign: 'center' }}>
                  No reviews yet. Be the first to review this course!
                </Typography>
              ) : (
                reviews.map(review => (
                  <ReviewCard 
                    key={review.id}
                    review={review}
                    onHelpfulClick={handleHelpfulClick}
                    onReportClick={handleReportClick}
                    userHasMarkedHelpful={helpfulMarks.includes(review.id)}
                  />
                ))
              )}
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          {/* Review form */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {userReview ? 'Edit Your Review' : 'Add a Review'}
            </Typography>
            
            {!user ? (
              <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" gutterBottom>
                  You need to be logged in to leave a review.
                </Typography>
                <Button variant="contained" color="primary" href="/login">
                  Login to Review
                </Button>
              </Paper>
            ) : (
              <ReviewForm 
                courseId={courseId}
                onSubmit={handleSubmitReview}
                initialRating={userReview?.rating || 0}
                initialTitle={userReview?.title || ''}
                initialContent={userReview?.content || ''}
                buttonText={userReview ? 'Update Review' : 'Submit Review'}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ReviewsSection;