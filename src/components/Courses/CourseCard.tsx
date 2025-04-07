import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CustomCard from '../UI/Card';
import { CourseCardProps } from '../../interfaces/props';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Rating from '../UI/Rating';
import { Box, Typography } from '@mui/material';

const StyledCourseCard = styled(CustomCard)`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .course-title {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .course-description {
    font-size: 1rem;
    color: #666;
  }

  .course-image {
    width: 100%;
    height: auto;
  }

  .course-rating {
    display: flex;
    align-items: center;
    margin-top: 8px;
  }
`;

const CourseCard: React.FC<CourseCardProps> = ({ course, variant = 'elevation', sx, ...props }) => {
  const { id, courseTitle, courseDescription, courseImage } = course;
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  // Fetch course ratings from reviews collection
  useEffect(() => {
    const fetchCourseRatings = async () => {
      if (!id) return;
      
      try {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('courseId', '==', id),
          where('approved', '==', true)
        );
        
        const querySnapshot = await getDocs(reviewsQuery);
        
        if (!querySnapshot.empty) {
          const reviews = querySnapshot.docs.map(doc => doc.data());
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / reviews.length);
          setTotalReviews(reviews.length);
        }
      } catch (error) {
        console.error('Error fetching course ratings:', error);
      }
    };
    
    fetchCourseRatings();
  }, [id]);

  const ratingDisplay = (
    <Box className="course-rating">
      <Rating value={averageRating} readOnly precision={0.5} size="small" />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
        ({totalReviews})
      </Typography>
    </Box>
  );

  return (
    <StyledCourseCard
      title={courseTitle}
      content={courseDescription}
      image={courseImage}
      variant={variant}
      footer={ratingDisplay}
      sx={sx}
      {...props}
    />
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.string,
    courseTitle: PropTypes.string.isRequired,
    courseDescription: PropTypes.string.isRequired,
    courseImage: PropTypes.string, // Make image prop optional
  }).isRequired as PropTypes.Validator<{
    id?: string;
    courseTitle: string;
    courseDescription: string;
    courseImage?: string;
  }>,
  variant: PropTypes.oneOf(['outlined', 'elevation']), // Allow different variants
  sx: PropTypes.object,
};

export default CourseCard;