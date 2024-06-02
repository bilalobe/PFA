import { configureStore, combineReducers } from '@reduxjs/toolkit';
import coursReducer from './reducers/coursReducer';
import userReducer from './reducers/userReducer';
import moduleReducer from './reducers/moduleReducer';
import questionReducer from './reducers/questionReducer';
import quizReducer from './reducers/quizReducer';
import resourceReducer from './reducers/resourceReducer';
import enrollmentReducer from './reducers/enrollmentReducer';
import forumReducer from './reducers/forumReducer';
import authReducer from './reducers/authReducer';
import adaptiveReducer from './reducers/adaptiveReducer';
import chatReducer from './reducers/chatReducer'; 

const store = configureStore({
    reducer: rootReducer,
});

export default store;
const rootReducer = combineReducers({
  cours: coursReducer,
  user: userReducer,
  module: moduleReducer,
  question: questionReducer,
  quiz: quizReducer,
  resource: resourceReducer,
  enrollment: enrollmentReducer,
  forum: forumReducer,
  auth: authReducer,
  adaptive: adaptiveReducer,
  chat: chatReducer, 
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;