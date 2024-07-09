import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFirestoreDocument, useFirestoreCollectionData } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import Question from '../../components/Quizzes/Question';
import { Quiz, QuizQuestion, Enrollment } from '../../interfaces/types';
import { db } from '../../firebaseConfig';
import { doc, getDoc, Timestamp, setDoc, updateDoc } from 'firebase/firestore';
import React from 'react';
import { enrollmentApi } from '../../utils/api';

const QuizPage: React.FC = () => {
    const router = useRouter();
    const { quizId } = router.query;
    const { user } = useAuth();

    const { docData: quiz, loading: quizLoading, error: quizError } = useFirestoreDocument<Quiz>(`quizzes/${quizId}`);

    const { data: questions, loading: questionsLoading, error: questionsError } = 
        useFirestoreCollectionData<QuizQuestion>(
            `quizzes/${quizId}/questions`,
            (collectionRef) => collectionRef.orderBy('order', 'asc')
        );

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [, setQuizStarted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const { docData: enrollment, loading: enrollmentLoading, error: enrollmentError } =
        useFirestoreDocument<Enrollment>(`enrollments/${quizId}`);

    useEffect(() => {
        const initializeQuizAttempt = async () => {
            if (user && quizId) {
                try {
                    const attemptRef = doc(db, 'quizAttempts', user.uid, Array.isArray(quizId) ? quizId[0] : quizId);
                    const attemptDoc = await getDoc(attemptRef);
                    if (attemptDoc.exists()) {
                        const attemptData = attemptDoc.data();
                        setQuizStarted(true);
                        setCurrentQuestionIndex(attemptData.currentQuestionIndex || 0);
                        setSelectedAnswers(attemptData.selectedAnswers || {});
                    } else {
                        await setDoc(attemptRef, {
                            userId: user.uid,
                            quizId: quizId,
                            startedAt: Timestamp.now(),
                            completed: false,
                            score: 0,
                            answers: {},
                            currentQuestionIndex: 0,
                        });
                        setQuizStarted(true);
                    }
                } catch (error) {
                    console.error('Error initializing quiz attempt:', error);
                }
            }
        };

        if (!enrollmentLoading && !enrollmentError && user && quizId && enrollment) {
            initializeQuizAttempt();
        }
    }, [user, quizId, enrollmentLoading, enrollmentError, enrollment]);

    useEffect(() => {
        if (quiz && user && !quizLoading) {
            const checkEnrollment = async () => {
                const isEnrolled = await enrollmentApi.enrollInCourse(quiz.courseId);
                if (!isEnrolled) {
                    router.push('/courses');
                }
            };
            checkEnrollment();
        }
    }, [quiz, user, quizLoading]);

    const handleAnswerSelect = (questionId: string, answerId: string) => {
        setSelectedAnswers({ ...selectedAnswers, [questionId]: answerId });
        updateAttemptDocument(questionId, answerId);
    };

    const updateAttemptDocument = async (questionId: string, answerId: string) => {
        if (user && quizId) {
            try {
                const attemptRef = doc(db, 'quizAttempts', user.uid, String(quizId));
                await updateDoc(attemptRef, {
                    selectedAnswers: { ...selectedAnswers, [questionId]: answerId },
                    currentQuestionIndex: currentQuestionIndex + 1,
                });
            } catch (error) {
                console.error('Error updating quiz attempt:', error);
            }
        }
    };

    const handleSubmitQuiz = async () => {
        setSubmitting(true);
        setSubmissionError(null);

        try {
            let calculatedScore = 0;
            questions.forEach((question) => {
                if (selectedAnswers[question.id] === question.correctAnswer) {
                    calculatedScore++;
                }
            });
            setScore(calculatedScore);

            if (typeof quizId === 'string') {
                if (!user) {
                    throw new Error('User is not authenticated');
                }
                const attemptRef = doc(db, 'quizAttempts', user.uid, quizId);
                await updateDoc(attemptRef, {
                    score: calculatedScore,
                    completed: true,
                    submittedAt: Timestamp.now(),
                });
            } else {
                throw new Error('quizId is not a valid string');
            }

            setShowResults(true);
        } catch (error: any) {
            setSubmissionError(error.message || 'Error submitting quiz.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmitQuiz();
        }
    };

    if (quizLoading || questionsLoading || enrollmentLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (quizError || questionsError || enrollmentError) {
        return (
            <Alert severity="error">
                {quizError || questionsError || enrollmentError}
            </Alert>
        );
    }

    if (!quiz || !questions) {
        return <Alert severity="error">Quiz not found.</Alert>;
    }

    if (showResults) {
        return (
            <Box>
                <Typography variant="h4">Quiz Results</Typography>
                <Typography variant="h6">Your Score: {score} / {questions.length}</Typography>
                <Button onClick={() => router.push('/courses')}>
                    Back to Courses
                </Button>
            </Box>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <Box>
            <Typography variant="h4">{quiz.title}</Typography>
            {currentQuestion && questions.length > 0 && <Question question={currentQuestion} onAnswerSelect={handleAnswerSelect} />}
            {submitting ? (
                <CircularProgress />
            ) : (
                <Button onClick={handleNextQuestion}>
                    {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
                </Button>
            )}
            {submissionError && (
                <Alert severity="error">{submissionError}</Alert>
            )}
        </Box>
    );
};

export default QuizPage;
