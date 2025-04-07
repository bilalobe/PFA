import { create } from 'zustand';
import { Course, Module, CourseFilter, Enrollment } from '../../../interfaces/types';
import { courseApi } from '../../../services/api/courses';
import { enrollmentApi } from '../../../services/api/enrollment';

interface CourseState {
  // State
  courses: Course[];
  enrolledCourses: Course[];
  featuredCourses: Course[];
  currentCourse: Course | null;
  modules: Record<string, Module[]>;
  filters: CourseFilter;
  searchQuery: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    lastVisible: any;
  };
  
  // Loading states
  loading: boolean;
  courseLoading: boolean;
  enrollmentLoading: boolean;
  enrollmentUpdating: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchCourses: (filters?: Partial<CourseFilter>, page?: number) => Promise<void>;
  fetchFeaturedCourses: () => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  fetchCourseDetails: (courseId: string) => Promise<Course | null>;
  fetchCourseModules: (courseId: string) => Promise<void>;
  searchCourses: (query: string) => Promise<void>;
  setFilters: (filters: Partial<CourseFilter>) => void;
  resetFilters: () => void;
  enrollInCourse: (courseId: string) => Promise<boolean>;
  unenrollFromCourse: (courseId: string) => Promise<boolean>;
  updateCourseProgress: (courseId: string, moduleId: string) => Promise<void>;
  getCourseProgress: (courseId: string) => Promise<number>;
}

// Default filter state
const defaultFilters: CourseFilter = {
  category: undefined,
  level: undefined,
  duration: undefined,
  price: undefined,
  sortBy: 'popularity'
};

export const courseStore = create<CourseState>((set, get) => ({
  // Initial state
  courses: [],
  enrolledCourses: [],
  featuredCourses: [],
  currentCourse: null,
  modules: {},
  filters: { ...defaultFilters },
  searchQuery: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    lastVisible: null
  },
  
  loading: false,
  courseLoading: false,
  enrollmentLoading: false,
  enrollmentUpdating: false,
  error: null,
  
  // Fetch courses with optional filtering and pagination
  fetchCourses: async (filters = {}, page = 1) => {
    set({ loading: true, error: null });
    try {
      const { currentPage, lastVisible } = get().pagination;
      const pageToFetch = page || currentPage;
      const limit = 10; // Courses per page
      
      const mergedFilters = { ...get().filters, ...filters };
      set({ filters: mergedFilters });
      
      const response = await courseApi.fetchCourses(
        mergedFilters,
        pageToFetch === 1 ? null : lastVisible,
        limit
      );
      
      const coursesData = response.courses.map(course => ({
        ...course,
        title: course.title || '',
        description: course.description || '',
        modules: course.modules || []
      })) as Course[];

      set(state => ({
        courses: pageToFetch === 1 ? coursesData : [...state.courses, ...coursesData],
        pagination: {
          currentPage: pageToFetch,
          totalPages: Math.ceil(coursesData.length / limit),
          lastVisible: response.lastVisible
        },
        loading: false
      }));
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        loading: false 
      });
    }
  },
  
  // Fetch featured courses for homepage
  fetchFeaturedCourses: async () => {
    set({ loading: true, error: null });
    try {
      const featuredCourses = await courseApi.fetchFeaturedCourses();
      set({ featuredCourses, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        loading: false 
      });
    }
  },
  
  // Fetch courses the user is enrolled in
  fetchEnrolledCourses: async () => {
    set({ enrollmentLoading: true, error: null });
    try {
      const rawEnrollments = await enrollmentApi.fetchEnrollments();
      const enrollments = rawEnrollments.map(enrollment => ({
              course: '',
              student: '',
              enrolledAt: enrollment.enrolledAt || null,
              completedModules: [],
              ...enrollment
            }));
      
      // If no enrollments, set empty array
      if (!enrollments.length) {
        set({ enrolledCourses: [], enrollmentLoading: false });
        return;
      }
      
      // Fetch course details for all enrollments
      const courseIds = enrollments.map(enrollment => enrollment.course);
      const enrolledCourses = await Promise.all(
        courseIds.map(id => courseApi.fetchCourseDetails(id))
      );
      
      // Add progress data from enrollments to courses
      const coursesWithProgress = enrolledCourses.map((course, index) => ({
        ...course,
        title: course.title || '',
        description: course.description || '',
        modules: course.modules || [],
        progress: enrollments[index].progress || 0,
        lastActivity: enrollments[index].lastActivity
      }));
      
      set({ enrolledCourses: coursesWithProgress, enrollmentLoading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        enrollmentLoading: false 
      });
    }
  },
  
  // Fetch detailed information about a specific course
  fetchCourseDetails: async (courseId: string) => {
    set({ courseLoading: true, error: null });
    try {
      const courseData = await courseApi.fetchCourseDetails(courseId);
      if (!courseData) return null;
      
      const course: Course = {
        ...courseData,
        title: courseData.title || '',
        description: courseData.description || '',
        modules: courseData.modules || []
      };
      set({ currentCourse: course, courseLoading: false });
      return course;
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        courseLoading: false 
      });
      return null;
    }
  },
  
  // Fetch modules for a specific course
  fetchCourseModules: async (courseId: string) => {
    set({ loading: true, error: null });
    try {
      // Skip if we already have the modules cached
      if (get().modules[courseId]) {
        set({ loading: false });
        return;
      }
      
      const modules = await courseApi.getModules(courseId);
      // Ensure modules match the Module interface
      const typedModules = modules.map(module => ({
        id: module.id,
        title: module.title || '',
        description: module.description || '',
        resources: module.resources || []
      })) as Module[];
      
      set(state => ({
        modules: {
          ...state.modules,
          [courseId]: typedModules
        },
        loading: false
      }));
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        loading: false 
      });
    }
  },
  
  // Search courses by title, description, or tags
  searchCourses: async (query: string) => {
    set({ loading: true, error: null, searchQuery: query });
    try {
      if (!query.trim()) {
        // If query is empty, fetch regular courses
        await get().fetchCourses();
        return;
      }
      
      const response = await courseApi.fetchCourses(query);
      const coursesData = response.courses.map(course => ({
        ...course,
        title: course.title || '',
        description: course.description || '',
        modules: course.modules || []
      })) as Course[];
      set({ 
        courses: coursesData, 
        loading: false,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          lastVisible: null
        }
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        loading: false 
      });
    }
  },
  
  // Update filter settings
  setFilters: (filters: Partial<CourseFilter>) => {
    set(state => ({ 
      filters: { ...state.filters, ...filters } 
    }));
    get().fetchCourses(undefined, 1); // Reset to first page with new filters
  },
  
  // Reset filters to default values
  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
    get().fetchCourses(undefined, 1); // Reset to first page with default filters
  },
  
  // Enroll the current user in a course
  enrollInCourse: async (courseId: string) => {
    set({ enrollmentUpdating: true, error: null });
    try {
      await enrollmentApi.enrollInCourse(courseId);
      
      // Refresh enrolled courses to include the new one
      await get().fetchEnrolledCourses();
      
      set({ enrollmentUpdating: false });
      return true;
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        enrollmentUpdating: false 
      });
      return false;
    }
  },
  
  // Unenroll the current user from a course
  unenrollFromCourse: async (enrollmentId: string) => {
    set({ enrollmentUpdating: true, error: null });
    try {
      const success = await enrollmentApi.unenrollFromCourse(enrollmentId);
      
      if (success) {
        // Refresh enrolled courses to remove the unenrolled course
        await get().fetchEnrolledCourses();
      }
      
      set({ enrollmentUpdating: false });
      return success;
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        enrollmentUpdating: false 
      });
      return false;
    }
  },
  
  // Mark a module as completed and update course progress
  updateCourseProgress: async (courseId: string, moduleId: string) => {
    set({ enrollmentUpdating: true, error: null });
    try {
      await enrollmentApi.completeModule(courseId, moduleId);
      
      // Refresh enrolled courses to update progress
      await get().fetchEnrolledCourses();
      
      set({ enrollmentUpdating: false });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        enrollmentUpdating: false 
      });
    }
  },
  
  // Get progress percentage for a specific course
  getCourseProgress: async (courseId: string) => {
    try {
      const progress = await enrollmentApi.getCourseProgress(courseId);
      return progress.progress;
    } catch (error) {
      set({ error: (error as Error).message });
      return 0;
    }
  }
}));

// Selectors for derived state
export const selectPopularCourses = (state: CourseState) => 
  state.courses.slice().sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0)).slice(0, 5);

export const selectRecentCourses = (state: CourseState) =>
  state.courses.slice().sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

export const selectInProgressCourses = (state: CourseState) =>
  state.enrolledCourses.filter(course => (course.progress || 0) > 0 && (course.progress || 0) < 100);