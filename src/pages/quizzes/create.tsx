import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  ListItemSecondaryAction,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { serverTimestamp } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const steps = ['Quiz Details', 'Add Questions', 'Review and Submit'];

const quizSchema = yup.object().shape({
  title: yup.string().required('Quiz title is required'),
  description: yup.string().required('Quiz description is required'),
});

const questionSchema = yup.object().shape({
  text: yup.string().required('Question text is required'),
  type: yup.string().required('Question type is required'),
  choices: yup.array().of(
    yup.object().shape({
      text: yup.string().required('Answer choice text is required'),
      isCorrect: yup.boolean().required('Please select a correct answer'),
    })
  ).min(2, 'At least two answer choices are required'),
});

const QuizCreationForm: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const { user } = useAuth();
  const { addDocument, createSubcollectionDocument } = useFirestore();

  const [activeStep, setActiveStep] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // --- Form Input Handlers ---
  const handleQuizDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.name, event.target.value);
  };

  // --- Question Handlers ---
  const handleAddQuestion = () => {
    const newQuestionId = `temp-${Date.now()}`;

    setQuestions((prevQuestions) => [
      ...prevQuestions,
      {
        id: newQuestionId,
        text: '',
        type: 'multiple_choice',
        choices: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
        order: prevQuestions.length + 1,
      },
    ]);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== questionId));
  };

  const handleQuestionTextChange = (questionId: string, newText: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.id === questionId ? { ...question, text: newText } : question
      )
    );
  };

  const handleQuestionTypeChange = (questionId: string, newType: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.id === questionId ? { ...question, type: newType } : question
      )
    );
  };

  const handleAddAnswerChoice = (questionId: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.id === questionId
          ? { ...question, choices: [...question.choices, { text: '', isCorrect: false }] }
          : question
      )
    );
  };

  const handleAnswerChoiceChange = (questionId: string, choiceIndex: number, newText: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) => {
        if (question.id === questionId) {
          const updatedChoices = [...question.choices];
          updatedChoices[choiceIndex].text = newText;
          return { ...question, choices: updatedChoices };
        }
        return question;
      })
    );
  };

  const handleCorrectAnswerChange = (questionId: string, choiceIndex: number) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) => {
        if (question.id === questionId) {
          const updatedChoices = question.choices.map((choice, i) => ({
            ...choice,
            isCorrect: i === choiceIndex,
          }));
          return { ...question, choices: updatedChoices };
        }
        return question;
      })
    );
  };

  const handleDeleteAnswerChoice = (questionId: string, choiceIndex: number) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) => {
        if (question.id === questionId) {
          const updatedChoices = [...question.choices];
          updatedChoices.splice(choiceIndex, 1);
          return { ...question, choices: updatedChoices };
        }
        return question;
      })
    );
  };

  // --- Navigation Handlers ---
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // --- Submit Quiz ---
  const handleSubmit = async (data: any) => {
    if (!courseId || !user) {
      setError('An error occurred.'); // More specific error message
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create the Quiz document in Firestore
      const newQuiz = {
        ...data,
        courseId: courseId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      };
      const quizRef = await addDocument('quizzes', newQuiz);

      // 2. Create each Question in a subcollection
      for (const question of questions) {
        await createSubcollectionDocument('quizzes', quizRef.id, 'questions', question);
      }

      // Redirect to the course details page or another suitable location
      router.push(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError('Failed to create the quiz.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Quiz Creation Form ---
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Quiz
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {index === 0 && (
                <form onSubmit={handleFormSubmit(handleSubmit)}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Quiz Details
                    </Typography>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Quiz Title"
                          fullWidth
                          margin="normal"
                          error={!!errors.title}
                          helperText={errors.title?.message}
                        />
                      )}
                    />
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Quiz Description"
                          fullWidth
                          multiline
                          rows={4}
                          margin="normal"
                          error={!!errors.description}
                          helperText={errors.description?.message}
                        />
                      )}
                    />
                    <Button variant="contained" onClick={handleNext} disabled={loading}>
                      Next
                    </Button>
                  </Box>
                </form>
              )}
              {index === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Add Questions
                  </Typography>
                  <List>
                    {questions.map((question, questionIndex) => (
                      <ListItem key={question.id}>
                        <ListItemText
                          primary={
                            <TextField
                              label="Question Text"
                              value={question.text}
                              onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                              fullWidth
                              margin="normal"
                              error={!!errors.text}
                              helperText={errors.text?.message}
                            />
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestion(question.id)}>
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                        <FormControl fullWidth>
                          <InputLabel id="question-type-label">Question Type</InputLabel>
                          <Select
                            labelId="question-type-label"
                            id="question-type"
                            value={question.type}
                            onChange={(e) => handleQuestionTypeChange(question.id, e.target.value)}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                          >
                            <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                            <MenuItem value="true_false">True/False</MenuItem>
                          </Select>
                        </FormControl>
                        <List>
                          {question.choices.map((choice, choiceIndex) => (
                            <ListItem key={choiceIndex}>
                              <ListItemText
                                primary={
                                  <TextField
                                    label="Answer Choice"
                                    value={choice.text}
                                    onChange={(e) => handleAnswerChoiceChange(question.id, choiceIndex, e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.choices?.[choiceIndex]?.text}
                                    helperText={errors.choices?.[choiceIndex]?.text?.message}
                                  />
                                }
                              />
                              <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAnswerChoice(question.id, choiceIndex)}>
                                  <Delete />
                                </IconButton>
                                <FormControlLabel
                                  control={
                                    <input
                                      type="checkbox"
                                      checked={choice.isCorrect}
                                      onChange={() => handleCorrectAnswerChange(question.id, choiceIndex)}
                                    />
                                  }
                                  label="Correct Answer"
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                        <Button variant="contained" onClick={() => handleAddAnswerChoice(question.id)}>
                          Add Answer Choice
                        </Button>
                        <FormHelperText error={!!errors.choices?.[questionIndex]?.message}>
                          {errors.choices?.[questionIndex]?.message}
                        </FormHelperText>
                      </ListItem>
                    ))}
                  </List>
                  <Button variant="contained" onClick={handleAddQuestion}>
                    Add Question
                  </Button>
                </Box>
              )}
              {index === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Review and Submit
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Please review your quiz details and questions before submitting.
                  </Typography>
                  <List>
                    {questions.map((question, questionIndex) => (
                      <ListItem key={question.id}>
                        <ListItemText
                          primary={
                            <Typography variant="body1" gutterBottom>
                              {question.text}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={question.type === 'multiple_choice' ? 'Multiple Choice' : 'True/False'}
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Typography variant="h6" gutterBottom>
          All steps completed - you are finished!
        </Typography>
      )}
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default QuizCreationForm;
