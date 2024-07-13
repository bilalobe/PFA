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
  IconButton,
  Chip,
  Alert,
  ListItemSecondaryAction,
  FormControlLabel,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { serverTimestamp } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { QuizQuestion } from '../../interfaces/types';

const steps = ['Quiz Details', 'Add Questions', 'Review and Submit'];

const quizSchema = yup.object().shape({
  title: yup.string().required('Quiz title is required'),
  description: yup.string().required('Quiz description is required'),
});

const QuizCreationForm: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const { user } = useAuth();
  const { addDocument, createSubcollectionDocument } = useFirestore('quizzes');

  const [activeStep, setActiveStep] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // --- Form Input Handlers ---

  // --- Question Handlers ---
  const handleAddQuestion = () => {
    const newQuestionId = `temp-${Date.now()}`;
  
    setQuestions((prevQuestions: QuizQuestion[]) => [
      ...prevQuestions,
      {
        id: newQuestionId,
        question: '', // Add the missing 'question' property
        options: [], // Add the missing 'options' property
        correctAnswer: '', // Add the missing 'correctAnswer' property
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
          const updatedChoices = question.choices.map((choice: any, i: number) => ({
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
        courseId: courseId as string,
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
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Quiz Title"
                        variant="outlined"
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
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button type="submit" variant="contained" sx={{ mt: 1, mr: 1 }}>
                        Next
                      </Button>
                      <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                        Back
                      </Button>
                    </div>
                  </Box>
                </form>
              )}

              {index === 1 && (
                <>
                  <Button onClick={handleAddQuestion} variant="contained" sx={{ mt: 1, mb: 2 }}>
                    Add Question
                  </Button>
                  <List>
                    {questions.map((question, qIndex) => (
                      <ListItem key={question.id}>
                        <Box sx={{ width: '100%' }}>
                          <TextField
                            label={`Question ${qIndex + 1}`}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={question.text}
                            onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                          />
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Question Type</InputLabel>
                            <Select
                              value={question.type}
                              onChange={(e) => handleQuestionTypeChange(question.id, e.target.value)}
                            >
                              <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                              <MenuItem value="true_false">True/False</MenuItem>
                              <MenuItem value="short_answer">Short Answer</MenuItem>
                            </Select>
                          </FormControl>
                          {question.type === 'multiple_choice' && (
                            <List>
                              {question.choices.map((choice: { text: unknown; isCorrect: any; }, cIndex: number) => (
                                <ListItem key={`${question.id}-choice-${cIndex}`}>
                                  <TextField
                                    label={`Choice ${cIndex + 1}`}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={choice.text}
                                    onChange={(e) =>
                                      handleAnswerChoiceChange(question.id, cIndex, e.target.value)
                                    }
                                  />
                                  <FormControlLabel
                                    control={
                                      <Chip
                                        label="Correct"
                                        color={choice.isCorrect ? 'primary' : 'default'}
                                        onClick={() => handleCorrectAnswerChange(question.id, cIndex)}
                                      />
                                    }
                                    label="Mark as Correct"
                                    labelPlacement="start"
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton
                                      edge="end"
                                      aria-label="delete"
                                      onClick={() => handleDeleteAnswerChoice(question.id, cIndex)}
                                    >
                                      <Delete />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                              <Button
                                onClick={() => handleAddAnswerChoice(question.id)}
                                variant="outlined"
                                sx={{ mt: 2 }}
                              >
                                Add Choice
                              </Button>
                            </List>
                          )}
                          <Button
                            onClick={() => handleDeleteQuestion(question.id)}
                            variant="contained"
                            color="secondary"
                            sx={{ mt: 2 }}
                          >
                            Delete Question
                          </Button>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
                        Next
                      </Button>
                      <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                        Back
                      </Button>
                    </div>
                  </Box>
                </>
              )}

              {index === 2 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Review your Quiz
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Title: {control.getValues('title')}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Description: {control.getValues('description')}
                  </Typography>
                  <List>
                    {questions.map((question, qIndex) => (
                      <ListItem key={question.id}>
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="subtitle1">{`Q${qIndex + 1}: ${
                            question.text
                          }`}</Typography>
                          {question.choices.map((choice: { isCorrect: any; text: any; }, cIndex: number) => (
                            <Typography
                              key={`${question.id}-choice-${cIndex}`}
                              variant="body2"
                              color={choice.isCorrect ? 'primary' : 'textSecondary'}
                            >
                              {`Choice ${cIndex + 1}: ${choice.text}`}
                            </Typography>
                          ))}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFormSubmit(handleSubmit)}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Submit'}
                      </Button>
                      <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                        Back
                      </Button>
                    </div>
                  </Box>
                </>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default QuizCreationForm;
