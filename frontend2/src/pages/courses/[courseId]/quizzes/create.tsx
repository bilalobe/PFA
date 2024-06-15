import { Step, StepLabel, Stepper } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import AddQuestionsForm from '../../../../components/Questions/AddQuestionsForm';
import QuizDetailsForm from '../../../../components/Quiz/QuizDetailsForm';
import ReviewAndSubmit from '../../../../components/Quiz/ReviewAndSubmit';
import { createQuiz } from '../../../store/courseSlice';
import QuizReview from './QuizReview';


function CreateQuizPage({ course }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const { courseId } = router.query;
  
    const [quizDetails, setQuizDetails] = useState({});
    const [questions, setQuestions] = useState([]);
    const [quizSubmitted, setQuizSubmitted] = useState(false);

  
    const handleSubmit = async () => {
      try {
        await dispatch(createQuiz({ courseId, quizDetails: { ...quizDetails, questions } }));
        router.push(`/courses/${courseId}`);
      } catch (error) {
        setSubmitError(error.message);
      }
    };

  const steps = ['Quiz Details', 'Add Questions', 'Review and Submit'];




  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <QuizDetailsForm onSubmit={setQuizDetails} onNext={() => setActiveStep(1)} />;
      case 1:
        return <AddQuestionsForm onSubmit={setQuestions} onNext={() => setActiveStep(2)} />;
      case 2:
        return <ReviewAndSubmit quizDetails={quizDetails} questions={questions} onSubmit={handleSubmit} />;
      case 3:
        return quizSubmitted ? <QuizReview /> : 'Quiz not submitted'; // Display the QuizReview component if the quiz has been submitted
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <div>
      <h1>Create Quiz for {course.title}</h1>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {getStepContent(activeStep)}
      {submitError && <p>Error: {submitError}</p>}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { courseId } = context.params;
  // Fetch course details here
  const course = await fetchCourseDetails(courseId);

  return {
    props: {
      course,
    },
  };
}

export default CreateQuizPage;