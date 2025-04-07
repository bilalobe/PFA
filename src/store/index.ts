// src/store/index.ts
import { authStore } from './features/auth/authStore';
import { courseStore } from './features/courses/courseStore';
import { liveSessionStore } from './features/liveSessions/liveSessionStore';
import { quizStore } from './features/quizzes/quizStore';
import { forumStore } from './features/forums/forumStore';
import { modalStore } from './ui/modalStore';

// Export all stores
export {
  authStore,
  courseStore,
  liveSessionStore,
  quizStore,
  forumStore,
  modalStore
};

// Export store hooks
export { 
  useAuthStore,
  useCourseStore,
  useForumStore,
  useQuizStore,
  useLiveSessionStore
} from './hooks';
