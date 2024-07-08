import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CustomCard from './Card';
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

const CourseCard: React.FC<CourseCardProps> = ({
  courseTitle,
  courseDescription,
  courseImage,
  variant = 'elevation',
  sx,
  ...props
}) => {
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
  courseTitle: PropTypes.string.isRequired,
  courseDescription: PropTypes.string.isRequired,
  courseImage: PropTypes.string, // Make image prop optional
  variant: PropTypes.oneOf(['outlined', 'elevation']), // Allow different variants
  sx: PropTypes.object,
};

export default CourseCard;