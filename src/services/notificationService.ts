import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CourseSubscription } from '../interfaces/types';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebaseConfig';

/**
 * Sends notifications to all students enrolled in a course when a live session is scheduled
 */
export const notifyLiveSessionScheduled = async (sessionId: string, courseId: string, title: string, startTime: Date) => {
  try {
    // Find all students enrolled in this course
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('courseId', '==', courseId)
    );
    
    const enrollmentDocs = await getDocs(enrollmentsQuery);
    
    // Create notification for each enrolled student
    const notificationPromises = enrollmentDocs.docs.map(doc => {
      const enrollment = doc.data();
      return addDoc(collection(db, 'notifications'), {
        userId: enrollment.userId,
        type: 'liveSessionScheduled',
        title: 'New Live Session',
        message: `A new live session "${title}" has been scheduled`,
        courseId,
        sessionId,
        startTime,
        createdAt: serverTimestamp(),
        read: false
      });
    });
    
    // Also add a calendar event for each student who has enabled calendar sync
    const subscriptionsQuery = query(
      collection(db, 'courseSubscriptions'),
      where('courseId', '==', courseId),
      where('calendarSync', '==', true)
    );
    
    const subscriptionDocs = await getDocs(subscriptionsQuery);
    const calendarPromises = subscriptionDocs.docs.map(doc => {
      const subscription = doc.data() as CourseSubscription;
      return addCalendarEvent(subscription.userId, {
        title: `Live Session: ${title}`,
        description: `Live session for your enrolled course`,
        startTime,
        endTime: new Date(startTime.getTime() + 60 * 60 * 1000), // Default 1 hour
        location: `Course: ${courseId}, Session: ${sessionId}`,
      });
    });
    
    await Promise.all([...notificationPromises, ...calendarPromises]);
    
  } catch (error) {
    console.error('Error sending live session notifications:', error);
  }
};

/**
 * Adds a calendar event for a user (implementation would depend on your calendar service)
 */
const addCalendarEvent = async (userId: string, eventDetails: any) => {
  // Implementation would vary based on your calendar integration
  // Could use Google Calendar API, Microsoft Graph API, etc.
  console.log(`Adding calendar event for user ${userId}:`, eventDetails);
  // Actual implementation here
};

/**
 * Schedules a notification for a live session
 */
export const scheduleLiveSessionNotification = async (sessionId: string, startTime: Date) => {
  // Calculate time before session to send notification (e.g., 15 minutes)
  const notificationTime = new Date(startTime.getTime() - 15 * 60 * 1000);
  
  // Schedule notification in Firebase Functions
  return httpsCallable(functions, 'scheduleNotification')({
    userId: auth.currentUser?.uid,
    type: 'liveSession',
    sessionId: sessionId,
    title: 'Upcoming Live Session',
    body: 'Your session starts in 15 minutes',
    scheduledTime: notificationTime
  });
};

/**
 * Schedules a reminder notification for a live session
 */
export const scheduleLiveSessionReminder = async (sessionId: string, userId: string) => {
  // Schedule notification 15 minutes before session starts
  const sessionData = await getDoc(doc(db, 'liveSessions', sessionId));
  if (sessionData.exists()) {
    const startTime = sessionData.data().scheduledStartTime.toDate();
    const reminderTime = new Date(startTime.getTime() - 15 * 60000);
    
    await addDoc(collection(db, 'notifications'), {
      userId,
      type: 'sessionReminder',
      sessionId,
      title: `Class Starting Soon: ${sessionData.data().title}`,
      body: 'Your live session begins in 15 minutes.',
      scheduledFor: reminderTime,
      read: false
    });
  }
};