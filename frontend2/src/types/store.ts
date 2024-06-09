import { combineReducers, configureStore } from '@reduxjs/toolkit';
import chatReducer from './features/chatSlice';
import courseReducer from './features/courseSlice';
import notificationReducer from './features/notificationSlice';
import questionReducer from './features/questionSlice';
import quizReducer from './features/quizSlice';
import resourceReducer from './features/resourceSlice';
import userReducer from './features/userSlice';
import { errorHandlingMiddleware } from './middleware/errorHandlingMiddleware';

const rootReducer = combineReducers({
  user: userReducer,
  course: courseReducer,
  chat: chatReducer,
  notification: notificationReducer,
  quiz: quizReducer,
  resource: resourceReducer,
  question: questionReducer,
});

import { Middleware } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware<RootState>().concat(errorHandlingMiddleware as Middleware),
  devTools: true,
});

export default store;
export type RootState = ReturnType<typeof rootReducer>;
