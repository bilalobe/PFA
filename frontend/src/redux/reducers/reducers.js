import { combineReducers } from 'redux';

import userReducer from './userReducer';
import moduleReducer from './moduleReducer';
import courseReducer from './courseReducer';
import resourceReducer from './resourceReducer';
import questionReducer from './questionReducer';
import quizReducer from './quizReducer';
import forumReducer from './forumReducer';
import enrollmentReducer from './enrollmentReducer'
import chatReducer from './chatReducer';
import reviewReducer from './reviewReducer';
import commentReducer from './commentReducer';
import authReducer from './authReducer';
import adaptativeReducer from './adaptativeReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  adaptative: adaptativeReducer,
  user: userReducer,
  module: moduleReducer,
  cours: courseReducer,
  question: questionReducer,
  quiz: quizReducer,
  resouce: resourceReducer,
  forum: forumReducer,
  enrollment: enrollmentReducer,
  chat: chatReducer,
  review: reviewReducer,
  comment: commentReducer,
});


export default rootReducer;