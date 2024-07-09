import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFirestoreDocument } from 'hooks/useFirestore';
import { useAuth } from '../../../hooks/useAuth';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ListItemSecondaryAction
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { quizApi } from '../../../utils/api';
import { Quiz, QuizQuestion } from '../../../interfaces/types';
import Question from '../../../components/Quizzes/Question';
import React from 'react';
import { useFirestoreCollectionData } from '../../../hooks/useFirestore';

const QuizManagement = () => {
  const router = useRouter();
  const { quizId } = router.query;
  const { user } = useAuth();
  const [editingQuizData, setEditingQuizData] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditQuestionDialog, setShowEditQuestionDialog] = useState(false);

  // Fetch the Quiz Data using your custom hook:
  const { docData: quiz, loading: quizLoading, error: quizError } = useFirestoreDocument(`quizzes/${quizId}`);
  
  // Fetch Quiz Questions
  const { data: questions, loading: questionsLoading, error: questionsError } = useFirestoreCollectionData(
    `quizzes/${quizId}/questions`,
    (collectionRef) => collectionRef.orderBy('order', 'asc')
  );

  useEffect(() => {
    if (quiz) {
      // Set the editing quiz data to the initial quiz values
      setEditingQuizData(quiz as Quiz | null);
    }
  }, [quiz]);

  // Function to handle editing the quiz
  const handleEditQuiz = async () => {
    try {
      if (editingQuizData && quizId) {
        await quizApi.updateQuiz(quizId.toString(), editingQuizData); // Assuming you have this in api.ts
        // Optionally, display a success message (e.g., using a Snackbar)
      }
    } catch (error: any) {
      console.error('Error updating quiz:', error);
    }
  };

  // Function to handle opening the delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  // Function to handle closing the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
  };

  // Function to handle deleting the quiz
  const handleDeleteQuiz = async () => {
    try {
      if (quizId) {
        await quizApi.deleteQuiz(quizId.toString());
        router.push('/quizzes');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  // Function to handle opening the edit question dialog
  const handleOpenEditQuestionDialog = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setShowEditQuestionDialog(true);
  };

  // Function to handle closing the edit question dialog
  const handleCloseEditQuestionDialog = () => {
    setEditingQuestion(null);
    setShowEditQuestionDialog(false);
  };

  // Function to handle updating the question
  const handleUpdateQuestion = async () => {
    try {
      if (editingQuestion && quizId) {
        const updatedData = 0; // Update this with the new data
        await quizApi.updateQuestion(quizId.toString(), editingQuestion.id, updatedData);
        // Optionally, display a success message (e.g., using a Snackbar)
      }
    } catch (error: any) {
      console.error('Error updating question:', error);
    } finally {
      handleCloseEditQuestionDialog();
    }
  };

  // Function to handle deleting a question
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      if (quizId) {
        await quizApi.deleteQuestion(quizId.toString(), questionId);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Authorization
  useEffect(() => {
    if (user && user.user_type !== 'admin' && user.user_type !== 'teacher') {
      router.push('/');
    }
  }, [user, router]);

  if (quizLoading || questionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (quizError || questionsError) {
    return (
      <Alert severity="error">
        {quizError || questionsError}
      </Alert>
    );
  }

  if (!quiz) {
    return (
      <Alert severity="error">Quiz not found.</Alert>
    );
  }

  return (
    <div>
      <Box>
        <Typography variant="h4" gutterBottom>
          {quiz.title}
        </Typography>
        <TextField
          value={editingQuizData?.description || quiz.description}
          onChange={(e) => setEditingQuizData((prevQuiz) => ({
            ...prevQuiz,
            description: e.target.value,
            id: prevQuiz?.id || '',
            title: prevQuiz?.title || ''
          }))}
          fullWidth
          multiline
          disabled={!editingQuizData}
        />
        <Typography variant="h6" gutterBottom>
          Questions:
        </Typography>
        <List>
          {questions.map((question) => (
            <ListItem key={question.id}>
              <ListItemText primary={question.text} />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditQuestionDialog(question as QuizQuestion)}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestion(question.id)}>
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => router.push(`/quizzes/${quizId}/questions/new`)}>
            Add Question
          </Button>
          {editingQuizData && (
            <Button variant="contained" onClick={handleEditQuiz} disabled={quizLoading}>
              Save Changes
            </Button>
          )}
          <Button variant="contained" color="error" onClick={handleOpenDeleteDialog}>
            Delete Quiz
          </Button>
        </Box>

        <Dialog open={showDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Delete Quiz</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this quiz? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteQuiz} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showEditQuestionDialog} onClose={handleCloseEditQuestionDialog}>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogContent>
            {editingQuestion && (
              <Question
                question={editingQuestion}
                onAnswerSelect={() => {}}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditQuestionDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleUpdateQuestion} color="secondary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default QuizManagement;
