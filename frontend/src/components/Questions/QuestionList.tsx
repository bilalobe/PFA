import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuestions, submitQuiz } from '../store/questionSlice';
import QuizQuestion from './QuizQuestion';
import { useRouter } from 'next/router';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Import your custom components
import CustomCard from '../CustomComponents/CustomCard';
import CustomButton from '../CustomComponents/CustomButton';
import CustomAlert from '../CustomComponents/CustomAlert';
import CustomSnackbar from '../CustomComponents/CustomSnackbar';
import CustomPagination from '../CustomComponents/CustomPagination';


  let validationSchema = {};
  for (let i = 1; i <= numberOfQuestions; i++) {
    validationSchema[`question${i}`] = Yup.string().required(`Answer for question ${i} is required`);
  }
  validationSchema = Yup.object().shape(validationSchema);

  

function QuestionList({ quizId, questions: quizQuestions }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { questions, loading, error, result } = useSelector((state) => state.question);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (!quizQuestions) {
      dispatch(fetchQuestions(quizId));
    }
  }, [dispatch, quizId, quizQuestions]);

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: Array.isArray(answer) ? [...answer] : answer,
    }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(submitQuiz({ quizId, answers: selectedAnswers }));
      setOpenSnackbar(true);
      router.push('/quiz/results');
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) return <CustomCircularProgress />;
  if (error) return <CustomAlert severity="error">{error}</CustomAlert>;
  if (result) return <CustomAlert severity="success">{result}</CustomAlert>;

  return (
    <Formik
      initialValues={selectedAnswers}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <CustomCard>
            <CustomCardContent>
              <CustomTypography variant="h4" component="div" gutterBottom>
                Questions
              </CustomTypography>
              {questions
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((question) => (
                  <QuizQuestion
                    key={question.id}
                    question={question}
                    onAnswerSelect={handleAnswerSelect}
                  />
                ))}
              <CustomButton
                variant="contained"
                color="primary"
                type="submit"
                disabled={currentPage !== Math.ceil(questions.length / itemsPerPage)}
                sx={{ backgroundColor: 'red', fontSize: '20px' }}
              >
                Submit
              </CustomButton>
            </CustomCardContent>
            <CustomPagination
              count={Math.ceil(questions.length / itemsPerPage)}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
            />
            <CustomSnackbar open={openSnackbar} onClose={handleCloseSnackbar}>
              <CustomAlert onClose={handleCloseSnackbar} severity="success">
                Quiz submitted successfully!
              </CustomAlert>
            </CustomSnackbar>
          </CustomCard>
        </Form>
      )}
    </Formik>
  );
}

export default QuestionList;