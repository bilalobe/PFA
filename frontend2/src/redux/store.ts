// frontend2/src/redux/store.ts

import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './reducers/notificationReducer';
import quizReducer from './reducers/quizReducer';

export interface RootState {
  notifications: ReturnType<typeof notificationReducer>;
  quiz: ReturnType<typeof quizReducer>;
  course: any; // replace 'any' with the type of your course
}

const store = configureStore({
  reducer: {
    notifications: notificationReducer,
    quiz: quizReducer,
    // add other reducers here
  },
});

export default store;