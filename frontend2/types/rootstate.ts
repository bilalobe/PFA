import { ChatState } from './store/chatSlice.ts';
import { NotificationState } from './store/notificationSlice.ts';
import { QuizState } from './store/quizSlice.ts';
import { ResourceState } from './store/resourceSlice.ts';
import { CourseState } from './store/courseSlice.ts';
import { QuestionState } from './store/questionSlice.ts';
import { UserState } from './store/userSlice.ts';
import { AuthState } from './store/authSlice.ts';
import { ProfileState } from './store/profileSlice.ts';


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