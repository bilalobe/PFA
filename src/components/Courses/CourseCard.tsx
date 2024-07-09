import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CustomCard from '../UI/Card';
import { CourseCardProps } from '../../interfaces/props';


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
`;

const CourseCard: React.FC<CourseCardProps> = ({ course, variant = 'elevation', sx, ...props }) => {
  const { courseTitle, courseDescription, courseImage } = course;

  return (
    <StyledCourseCard
      title={courseTitle}
      content={courseDescription}
      image={courseImage}
      variant={variant}
      sx={sx}
      {...props}
    />
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    courseTitle: PropTypes.string.isRequired,
    courseDescription: PropTypes.string.isRequired,
    courseImage: PropTypes.string, // Make image prop optional
  }).isRequired as PropTypes.Validator<{
    courseTitle: string;
    courseDescription: string;
    courseImage?: string;
  }>,
  variant: PropTypes.oneOf(['outlined', 'elevation']), // Allow different variants
  sx: PropTypes.object,
};

export default CourseCard;