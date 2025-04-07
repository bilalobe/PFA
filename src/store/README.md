# State Management with Zustand

This directory contains the standardized state management structure for the PFA E-learning platform using Zustand.

## Directory Structure

- /store - Root directory for all state management
  - index.ts - Exports all stores and hooks
  - hooks.ts - Re-exports store hooks with consistent naming
  - /ui - UI-related state (modals, theme, etc.)
  - /features - Feature-specific state

## Migration Guide

To migrate from Redux or React local state to Zustand:

1. Identify which store the state belongs to (feature or UI)
2. Create a new file in the appropriate directory if needed
3. Define the state interface and create the store
4. Replace useSelector/useDispatch or useState with the Zustand hook

### Example Migration:

**Before (with Redux):**
`	sx
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuestions, submitQuiz } from '../store/questionSlice';

function Component() {
  const dispatch = useDispatch();
  const { questions, loading } = useSelector((state) => state.question);
  
  useEffect(() => {
    dispatch(fetchQuestions(quizId));
  }, [dispatch, quizId]);
  
  const handleSubmit = () => {
    dispatch(submitQuiz({ answers }));
  };
}
`

**After (with Zustand):**
`	sx
import { useQuizStore } from '../store';

function Component() {
  const { questions, loading, fetchQuestions, submitQuiz } = useQuizStore();
  
  useEffect(() => {
    fetchQuestions(quizId);
  }, [fetchQuestions, quizId]);
  
  const handleSubmit = () => {
    submitQuiz({ answers });
  };
}
`
