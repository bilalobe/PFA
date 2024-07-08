import { combineReducers, configureStore, Middleware } from '@reduxjs/toolkit';
import chatReducer from './features/chat-function/chatSlice';
import courseReducer from './features/course/courseSlice';
import notificationReducer from './features/notification/notificationSlice';
import questionReducer from './features/question/questionSlice';
import quizReducer from './features/quiz/quizSlice';
import resourceReducer from './features/resource/resourceSlice';
import userReducer from './features/user/userSlice';
import authReducer from './features/authentification/authSlice';
import enrollmentReducer from './features/enrollment/enrollmentSlice';
import contentGenerationReducer from "./features/genAI/contentGenerationSlice"; 
import { errorHandlingMiddleware } from './middleware/errorHandlingMiddleware';

const rootReducer = combineReducers({
  user: userReducer,
  course: courseReducer,
  chat: chatReducer,
  notification: notificationReducer,
  quiz: quizReducer,
  resource: resourceReducer,
  question: questionReducer,
  auth: authReducer,
  enrollment: enrollmentReducer,
  contentGeneration: contentGenerationReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(errorHandlingMiddleware as Middleware),
  devTools: true,
});

export default store;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;