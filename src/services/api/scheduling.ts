import { 
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, 
  getDocs, query, where, orderBy, serverTimestamp, 
  writeBatch, Timestamp, arrayUnion, arrayRemove 
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { handleApiError } from "../utils/errorHandling";
import { Schedule, ScheduleResponse } from "../../interfaces/types";

export const scheduleApi = {
  // Create a new schedule item
  createSchedule: async (scheduleData: Omit<Schedule, 'id'>): Promise<ScheduleResponse> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const scheduleRef = collection(db, 'schedules');
      const docRef = await addDoc(scheduleRef, {
        ...scheduleData,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      // If this schedule is for a course, add reference to course document
      if (scheduleData.courseId) {
        const courseRef = doc(db, 'courses', scheduleData.courseId);
        await updateDoc(courseRef, {
          schedules: arrayUnion(docRef.id)
        });
      }

      return { 
        id: docRef.id, 
        details: { id: docRef.id, ...scheduleData } 
      };
    } catch (error) {
      handleApiError(error, 'Failed to create schedule.');
      throw error;
    }
  },

  // Update an existing schedule
  updateSchedule: async (id: string, updates: Partial<Schedule>): Promise<void> => {
    try {
      const scheduleRef = doc(db, 'schedules', id);
      await updateDoc(scheduleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleApiError(error, `Failed to update schedule ${id}.`);
      throw error;
    }
  },

  // Delete a schedule
  deleteSchedule: async (id: string, courseId?: string): Promise<void> => {
    try {
      // If this schedule is for a course, remove reference from course document
      if (courseId) {
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, {
          schedules: arrayRemove(id)
        });
      }

      const scheduleRef = doc(db, 'schedules', id);
      await deleteDoc(scheduleRef);
    } catch (error) {
      handleApiError(error, `Failed to delete schedule ${id}.`);
      throw error;
    }
  },

  // Get a specific schedule
  getSchedule: async (id: string): Promise<Schedule> => {
    try {
      const scheduleRef = doc(db, 'schedules', id);
      const snapshot = await getDoc(scheduleRef);
      
      if (!snapshot.exists()) {
        throw new Error(`Schedule ${id} not found.`);
      }
      
      return { id: snapshot.id, ...snapshot.data() } as Schedule;
    } catch (error) {
      handleApiError(error, `Failed to fetch schedule ${id}.`);
      throw error;
    }
  },

  // Get all schedules for a user (as attendee or creator)
  getUserSchedules: async (userId?: string, startDate?: Date, endDate?: Date): Promise<Schedule[]> => {
    try {
      const user = auth.currentUser;
      if (!user && !userId) {
        throw new Error("User not authenticated.");
      }

      const uid = userId || user?.uid;
      
      // Query where user is creator or attendee
      const queryConstraints = [
        where('createdBy', '==', uid)
      ];

      // If date range is specified, add constraints
      if (startDate) {
        queryConstraints.push(where('startTime', '>=', startDate));
      }
      
      if (endDate) {
        queryConstraints.push(where('startTime', '<=', endDate));
      }

      // First get schedules where user is creator
      const creatorSchedulesQuery = query(
        collection(db, 'schedules'),
        ...queryConstraints
      );
      
      const creatorSnapshot = await getDocs(creatorSchedulesQuery);
      const creatorSchedules = creatorSnapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as Schedule
      );
      
      // Then get schedules where user is attendee
      const attendeeSchedulesQuery = query(
        collection(db, 'schedules'),
        where('attendees', 'array-contains', uid)
      );
      
      const attendeeSnapshot = await getDocs(attendeeSchedulesQuery);
      const attendeeSchedules = attendeeSnapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as Schedule
      );
      
      // Combine results, removing duplicates
      const allSchedules = [...creatorSchedules];
      attendeeSchedules.forEach(schedule => {
        if (!allSchedules.some(s => s.id === schedule.id)) {
          allSchedules.push(schedule);
        }
      });
      
      return allSchedules;
    } catch (error) {
      handleApiError(error, 'Failed to fetch user schedules.');
      throw error;
    }
  },

  // Get all schedules for a specific course
  getCourseSchedules: async (courseId: string): Promise<Schedule[]> => {
    try {
      const schedulesQuery = query(
        collection(db, 'schedules'),
        where('courseId', '==', courseId),
        orderBy('startTime', 'asc')
      );
      
      const snapshot = await getDocs(schedulesQuery);
      return snapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as Schedule
      );
    } catch (error) {
      handleApiError(error, `Failed to fetch schedules for course ${courseId}.`);
      throw error;
    }
  },

  // Add attendee to schedule
  addAttendee: async (scheduleId: string, userId: string): Promise<void> => {
    try {
      const scheduleRef = doc(db, 'schedules', scheduleId);
      await updateDoc(scheduleRef, {
        attendees: arrayUnion(userId)
      });
    } catch (error) {
      handleApiError(error, `Failed to add attendee to schedule ${scheduleId}.`);
      throw error;
    }
  },

  // Remove attendee from schedule
  removeAttendee: async (scheduleId: string, userId: string): Promise<void> => {
    try {
      const scheduleRef = doc(db, 'schedules', scheduleId);
      await updateDoc(scheduleRef, {
        attendees: arrayRemove(userId)
      });
    } catch (error) {
      handleApiError(error, `Failed to remove attendee from schedule ${scheduleId}.`);
      throw error;
    }
  },

  // Send reminders for upcoming schedules
  sendScheduleReminders: async (): Promise<void> => {
    try {
      // Get schedules happening in the next hour that haven't had reminders sent
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
      
      const upcomingSchedulesQuery = query(
        collection(db, 'schedules'),
        where('startTime', '>=', now),
        where('startTime', '<=', inOneHour),
        where('reminderSent', '==', false)
      );
      
      const snapshot = await getDocs(upcomingSchedulesQuery);
      
      // Update each schedule to mark reminder as sent
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { reminderSent: true });
      });
      
      await batch.commit();

      // Process each schedule to send notifications
      // This would typically be handled by a separate cloud function
      const schedulesToNotify = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Schedule[];

      for (const schedule of schedulesToNotify) {
        // Create notifications for each attendee
        if (schedule.attendees && schedule.attendees.length) {
          for (const attendeeId of schedule.attendees) {
            await notificationApi.createNotification({
              userId: attendeeId,
              title: 'Upcoming Session',
              body: `Your session "${schedule.title}" starts in less than an hour.`,
              type: 'schedule',
              relatedId: schedule.id
            });
          }
        }
      }
    } catch (error) {
      handleApiError(error, 'Failed to send schedule reminders.');
      throw error;
    }
  }
};

// Import the notificationApi to create notifications
import { notificationApi } from './notifications';

export default scheduleApi;