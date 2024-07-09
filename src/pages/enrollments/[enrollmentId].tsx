import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { Course, Enrollment, Module } from '../../interfaces/types';
import { orderBy, query, doc, getFirestore, DocumentData, DocumentReference, collectionGroup } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

import CourseList from '../../components/Courses/CourseInfo';
import ModuleList from '../../components/Courses/ModuleList';
import { enrollmentApi } from '../../utils/api';
import React from 'react';

const EnrollmentDetails = () => {
    const router = useRouter();
    const { enrollmentId } = router.query;
    const { user } = useAuth();
    const db = getFirestore();

    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [completedModules, setCompletedModules] = useState<string[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (enrollmentId && typeof enrollmentId === 'string') {
            const enrollmentRef: DocumentReference<DocumentData> = doc(db, `enrollments/${enrollmentId}`);
            const unsubscribeEnrollment = onSnapshot(
                enrollmentRef,
                (doc) => {
                    if (doc.exists()) {
                        const enrollmentData = doc.data() as Enrollment;
                        setEnrollment(enrollmentData);

                        const courseQuery = collectionGroup(db, 'courses');
                        const unsubscribeCourse = onSnapshot(
                            courseQuery,
                            (snapshot) => {
                                if (!snapshot.empty) {
                                    snapshot.forEach((doc) => {
                                        setCourse(doc.data() as Course);
                                    });
                                } else {
                                    setError('Course not found.');
                                }
                                setLoading(false);
                            },
                            (error) => {
                                console.error('Error fetching course:', error);
                                setError('Error fetching course.');
                                setLoading(false);
                            }
                        );

                        return () => unsubscribeCourse();
                    } else {
                        setError('Enrollment not found.');
                        setLoading(false);
                    }
                },
                (error) => {
                    console.error('Error fetching enrollment:', error);
                    setError('Error fetching enrollment.');
                    setLoading(false);
                }
            );

            return () => unsubscribeEnrollment();
        }
    }, [enrollmentId, db]);

    useEffect(() => {
        if (enrollment?.courseId) {
            const modulesCollection = collectionGroup(db, 'modules');
            const modulesQuery = query(modulesCollection, orderBy('order'));

            const unsubscribeModules = onSnapshot(
                modulesQuery,
                (snapshot) => {
                    const modulesData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Module[];
                    setModules(modulesData);
                },
                (error) => {
                    console.error('Error fetching modules:', error);
                    setError('Error fetching modules.');
                }
            );

            return () => unsubscribeModules();
        }
    }, [db, enrollment?.courseId]);

    useEffect(() => {
        if (enrollment && enrollment.completedModules) {
            setCompletedModules(enrollment.completedModules);
        }
    }, [enrollment]);

    const handleModuleComplete = async (moduleId: string) => {
        try {
            if (typeof enrollmentId === 'string') {
                await enrollmentApi.completeModule(enrollmentId, moduleId);
                setCompletedModules([...completedModules, moduleId]);
            }
        } catch (error: any) {
            console.error('Error marking module complete:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        );
    }

    if (!enrollment || !course) {
        return <Alert severity="error">Enrollment or Course not found.</Alert>;
    }

    const isAuthorized = user?.uid === enrollment.studentId || user?.userType === 'teacher' || user?.userType === 'supervisor';

    if (!isAuthorized) {
        return <Alert severity="error">You are not authorized to view this enrollment.</Alert>;
    }

    return (
        <div>
            <Typography variant="h4">
                Enrollment Details
            </Typography>

            {course && <CourseList courses={[course]} loading={false} error={null} searchQuery={''} lastVisible={undefined} currentPage={0} coursesPerPage={0} onSearch={() => {}} onNextPage={() => {}} onPreviousPage={() => {}} />}

            {modules && <ModuleList modules={modules} completedModules={completedModules} onModuleComplete={handleModuleComplete} />}
        </div>
    );
};

export default EnrollmentDetails;

