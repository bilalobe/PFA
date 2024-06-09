import { ChatState } from './chatSlice';
import { NotificationState } from './notificationSlice';
import { QuizState } from './quizSlice';
import { ResourceState } from './resourceSlice';
import { CourseState } from './courseSlice';
import { QuestionState } from './questionSlice';
import { UserState } from './userSlice';
import { AuthState } from './authSlice';

export interface RootState {
  chat: ChatState;
  notification: NotificationState;
  quiz: QuizState;
  resource: ResourceState;
  course: CourseState;
  question: QuestionState;
  user: UserState;
  auth: AuthState;
}