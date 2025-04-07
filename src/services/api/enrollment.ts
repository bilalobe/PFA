import { 
  collection, addDoc, getDocs, query, 
  where, doc, getDoc, deleteDoc, updateDoc, 
  Timestamp, serverTimestamp, arrayUnion, arrayRemove 
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { handleApiError } from "../utils/errorHandling";

export const enrollmentApi = {
  // Fetch enrollments for current user
  fetchEnrollments: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const q = query(collection(db, 'enrollments'), where('user', '==', user.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleApiError(error, 'Failed to fetch enrollments.');
    }
    return [];
  },

  // Enroll current user in a course
  enrollInCourse: async (courseId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      // Check if already enrolled
      const existingQuery = query(
        collection(db, 'enrollments'),
        where('user', '==', user.uid),
        where('course', '==', courseId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error("You are already enrolled in this course.");
      }

      // Create enrollment
      const enrollmentRef = collection(db, 'enrollments');
      const enrollmentData = { 
        user: user.uid, 
        course: courseId,
        enrolledAt: serverTimestamp(),
        completedModules: [],
        progress: 0,
        lastActivity: serverTimestamp()
      };
      
      const docRef = await addDoc(enrollmentRef, enrollmentData);
      return { id: docRef.id, ...enrollmentData };
    } catch (error) {
      handleApiError(error, 'Failed to enroll in course.');
    }
  },

  // Unenroll from a course
  unenrollFromCourse: async (enrollmentId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const enrollmentRef = doc(db, 'enrollments', enrollmentId);
      const enrollmentSnap = await getDoc(enrollmentRef);

      if (!enrollmentSnap.exists()) {
        throw new Error('Enrollment not found.');
      }

      if (enrollmentSnap.data().user !== user.uid) {
        throw new Error('You are not authorized to unenroll from this course.');
      }

      await deleteDoc(enrollmentRef);
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to unenroll from course.');
      return false;
    }
  },
  
  // Mark a module as completed
  completeModule: async (courseId: string, moduleId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }
      
      // Find the enrollment
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('user', '==', user.uid),
        where('course', '==', courseId)
      );
      
      const enrollmentsSnap = await getDocs(enrollmentsQuery);
      
      if (enrollmentsSnap.empty) {
        throw new Error('You are not enrolled in this course.');
      }
      
      const enrollmentDoc = enrollmentsSnap.docs[0];
      const enrollmentRef = doc(db, 'enrollments', enrollmentDoc.id);
      
      // Add moduleId to completedModules array if not already there
      await updateDoc(enrollmentRef, {
        completedModules: arrayUnion(moduleId),
        lastActivity: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      handleApiError(error, `Failed to mark module ${moduleId} as completed.`);
      return false;
    }
  },
  
  // Get course progress
  getCourseProgress: async (courseId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }
      
      // Find the enrollment
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('user', '==', user.uid),
        where('course', '==', courseId)
      );
      
      const enrollmentsSnap = await getDocs(enrollmentsQuery);
      
      if (enrollmentsSnap.empty) {
        return { enrolled: false, progress: 0, completedModules: [] };
      }
      
      const enrollmentData = enrollmentsSnap.docs[0].data();
      
      // Get total number of modules in the course
      const modulesQuery = query(collection(db, 'courses', courseId, 'modules'));
      const modulesSnap = await getDocs(modulesQuery);
      const totalModules = modulesSnap.size;
      
      const completedModules = enrollmentData.completedModules || [];
      const progress = totalModules > 0 ? (completedModules.length / totalModules) * 100 : 0;
      
      return {
        enrolled: true,
        progress: Math.round(progress),
        completedModules
      };
    } catch (error) {
      handleApiError(error, `Failed to get progress for course ${courseId}.`);
      return { enrolled: false, progress: 0, completedModules: [] };
    }
  }
};

export default enrollmentApi;