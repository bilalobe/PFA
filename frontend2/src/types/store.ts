async (params:type) => {
  import { combineReducers, configureStore } from '@reduxjs/toolkit';
  import chatReducer from './features/chat-function/chatSlice';
  import courseReducer from './features/course/courseSlice';
  import notificationReducer from './features/notificationSlice';
  import questionReducer from './features/course/questionSlice';
  import quizReducer from './features/course/quizSlice';
  import resourceReducer from './features/course/resourceSlice';
  import userReducer from './features/userSlice';
  import authReducer from './features/authSlice';
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
  });
  
  import { Middleware } from '@reduxjs/toolkit';
  
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(errorHandlingMiddleware as Middleware),
    devTools: true,
  });
  
  export default store;
  export type RootState = ReturnType<typeof rootReducer>;
  
}