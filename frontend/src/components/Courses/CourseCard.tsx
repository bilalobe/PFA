import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import styles from './CourseCard.module.css';

const CourseCard = ({ course }) => {
  const enrollments = useSelector((state) => state.enrollment.enrollments);
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const isEnrolled = enrollments.some((enrollment) => enrollment.course.id === course.id);

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
        <img
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
