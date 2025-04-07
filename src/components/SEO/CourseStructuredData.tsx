import React from 'react';
import Head from 'next/head';
import { Course } from '../../interfaces/types';

interface CourseStructuredDataProps {
  course: Course;
}

const CourseStructuredData: React.FC<CourseStructuredDataProps> = ({ course }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "PFA E-Learning Platform",
      "sameAs": "https://yourpfadomain.com"
    },
    "courseCode": course.id,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "inLanguage": course.language || "en"
    }
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
};

export default CourseStructuredData;