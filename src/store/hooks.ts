// src/store/hooks.ts
import { authStore } from './features/auth/authStore';
import { courseStore } from './features/courses/courseStore';
import { liveSessionStore } from './features/liveSessions/liveSessionStore';
import { quizStore } from './features/quizzes/quizStore';
import { forumStore } from './features/forums/forumStore';

// Re-export the hooks with consistent naming
export const useAuthStore = authStore;
export const useCourseStore = courseStore;
export const useLiveSessionStore = liveSessionStore;
export const useQuizStore = quizStore;
export const useForumStore = forumStore;
