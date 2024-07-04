import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import styles from './CourseCard.module.css';
import Image from 'next/image';
import { RootState } from '@/types/store';
import EnrollmentReducer from '@/types/store';

const CourseCard = ({ course }) => {
  const enrollments = useSelector((state: RootState & { enrollment: typeof EnrollmentReducer }) => state.enrollment.enrollments);
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const isEnrolled = enrollments.some((enrollment: { course: { id: string | number }; }) => enrollment.course.id === course.id);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!course) {
    return (
      <div className={styles.alert}>
        Course data could not be loaded.
      </div>
    );
  }

  return (
    <div className={styles.gridItem}>
      <div className={styles.card}>
        <Image
          className={styles.cardMedia}
          alt={course.name}
          src={course.imageUrl || '/path/to/placeholder.jpg'}
        />
        <div className={styles.cardContent}>
          <h5 className={styles.title}>{course.name}</h5>
          <p className={styles.description}>{course.description}</p>
          <div className={styles.actions}>
            {!loading && isAuthenticated ? (
              isEnrolled ? (
                <Link href={`/courses/${course.id}`}>
                  <a className={styles.button}>View Course</a>
                </Link>
              ) : (
                <Link href={`/enroll/${course.id}`}>
                  <a className={styles.button}>Enroll</a>
                </Link>
              )
            ) : (
              <Link href="/login">
                <a className={styles.button}>Login to Enroll</a>
              </Link>
            )}
            <Link href={`/courses/${course.id}`}>
              <a className={`${styles.button} ${styles.outlinedButton}`}>Learn More</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;