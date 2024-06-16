import * as Sentry from '@sentry/react';
import { AppError } from '@/types/ErrorType';

export const errorHandlingMiddleware = (store: { dispatch: (arg0: { type: string; payload: AppError; }) => void; }) => (next: (arg0: any) => any) => (action: { type: string; payload: AppError; }) => {
  if (action.type.endsWith('FAILURE')) {
    console.error('Global Error:', action.payload);
    store.dispatch(setGlobalError(action.payload)); 
    Sentry.captureException(action.payload); 
  }
  return next(action);
};

// Action to set global error
export const setGlobalError = (payload: AppError) => ({
  type: 'SET_GLOBAL_ERROR',
  payload,
});