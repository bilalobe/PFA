import { auth } from "../../firebaseConfig";
import { firestoreService, queryBuilders } from "../firebase/firestore";
import { handleApiError } from "../utils/errorHandling";
import { CourseData } from "../../interfaces/types";

const COLLECTION_PATH = 'courses';

export const courseApi = {
  fetchCourses: async (filters = {}, lastVisible = null, limit = 10) => {
    try {
      const constraints = [queryBuilders.orderByCreatedAt('desc')];
      
      // Add filters if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          constraints.push(queryBuilders.whereField(key, '==', value));
        }
      });
      
      const result = await firestoreService.list<CourseData>(
        COLLECTION_PATH,
        constraints,
        lastVisible,
        limit
      );
      
      return { 
        courses: result.items,
        lastVisible: result.lastVisible
      };
    } catch (error) {
      handleApiError(error, 'Failed to fetch courses.');
      throw error;
    }
  },

  fetchCourseDetails: async (courseId: string) => {
    try {
      return await firestoreService.get<CourseData>(COLLECTION_PATH, courseId);
    } catch (error) {
      handleApiError(error, `Failed to fetch course ${courseId}.`);
      throw error;
    }
  },

  createCourse: async (courseData: Partial<CourseData>) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const course = {
        ...courseData,
        instructor: user.uid,
      };

      return await firestoreService.create<CourseData>(COLLECTION_PATH, course as CourseData);
    } catch (error) {
      handleApiError(error, 'Failed to create course.');
      throw error;
    }
  },

  updateCourse: async (courseId: string, updatedData: Partial<CourseData>) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      // Verify ownership
      const course = await firestoreService.get<CourseData>(COLLECTION_PATH, courseId);
      
      if (course.instructor !== user.uid) {
        throw new Error("You are not authorized to update this course.");
      }

      return await firestoreService.update<CourseData>(COLLECTION_PATH, courseId, updatedData);
    } catch (error) {
      handleApiError(error, 'Failed to update the course.');
      throw error;
    }
  },

  deleteCourse: async (courseId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      // Verify ownership
      const course = await firestoreService.get<CourseData>(COLLECTION_PATH, courseId);
      
      if (course.instructor !== user.uid) {
        throw new Error("You do not have permission to delete this course.");
      }

      return await firestoreService.delete(COLLECTION_PATH, courseId);
    } catch (error) {
      handleApiError(error, 'Failed to delete the course.');
      throw error;
    }
  },
  
  // Module-related methods
  getModules: async (courseId: string) => {
    try {
      const modulesPath = `${COLLECTION_PATH}/${courseId}/modules`;
      const result = await firestoreService.list(
        modulesPath,
        [queryBuilders.orderByCreatedAt('asc')]
      );
      
      return result.items;
    } catch (error) {
      handleApiError(error, `Failed to fetch modules for course ${courseId}.`);
      throw error;
    }
  }
};