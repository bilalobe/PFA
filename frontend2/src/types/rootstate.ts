import { ChatState } from './store/chatSlice.js';
import { NotificationState } from './store/notificationSlice.js';
import { QuizState } from './store/quizSlice.js';
import { ResourceState } from './store/resourceSlice.js';
import { CourseState } from './store/courseSlice.js';
import { QuestionState } from './store/questionSlice.js';
import { UserState } from './store/userSlice.js';
import { AuthState } from './store/authSlice.js';
import { ProfileState } from './store/profileSlice.js';


export interface RootState {
    chat: ChatState;
    notification: NotificationState;
    quiz: QuizState;
    resource: ResourceState;
    course: CourseState;
    question: QuestionState;
    user: UserState;
    auth: AuthState;
    profile: ProfileState;
}