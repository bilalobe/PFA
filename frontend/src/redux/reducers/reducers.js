import { combineReducers } from 'redux';

import userReducer from './userReducer';
import moduleReducer from './moduleReducer';
import courseReducer from './courseReducer';
import resourceReducer from './resourceReducer';
import questionReducer from './questionReducer';
import quizReducer from './quizReducer';
import forumReducer from './forumReducer';
import enrollmentReducer from './enrollmentReducer'

const rootReducer = combineReducers({
  user: userReducer,
  module: moduleReducer,
  cours: courseReducer,
  question: questionReducer,
  quiz: quizReducer,
  resouce: resourceReducer,
  forum: forumReducer,
  enrollment: enrollmentReducer
});


export default rootReducer;