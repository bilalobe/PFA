import * as Sentry from '@sentry/react';

export const errorHandlingMiddleware = (store: { dispatch: (arg0: { type: string; payload: any; }) => void; }) => (next: (arg0: any) => any) => (action: { type: string; payload: any; }) => {
  if (action.type.endsWith('FAILURE')) {
    console.error('Global Error:', action.payload);
    store.dispatch(setGlobalError(action.payload)); 
    Sentry.captureException(action.payload); 
  }
  return next(action);
};

// Action to set global error
export const setGlobalError = (payload: any) => ({
  type: 'SET_GLOBAL_ERROR',
  payload,
});
