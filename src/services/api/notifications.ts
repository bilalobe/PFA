import { 
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, limit, 
  writeBatch, serverTimestamp, QueryDocumentSnapshot,
  startAfter, setDoc
} from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../../firebaseConfig";
import { handleApiError } from "../utils/errorHandling";
import type { Notification, NotificationPreferences } from "../../interfaces/types";

export const notificationApi = {
  // Create a new notification for a user
  createNotification: async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<string> => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const newNotification = {
        ...notification,
        isRead: false,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(notificationsRef, newNotification);
      
      // If we're in a browser environment, try to send a push notification
      if (typeof window !== 'undefined' && notification.userId) {
        try {
          // Get user's notification preferences
          const userPrefsDoc = await getDoc(doc(db, 'notificationPreferences', notification.userId));
          const userPrefs = userPrefsDoc.data() as NotificationPreferences;
          
          // Check if user has push notifications enabled and has a valid FCM token
          if (userPrefs?.push && userPrefs?.token) {
            // Call a Cloud Function to send the push notification
            const sendPushFn = httpsCallable(functions, 'sendPushNotification');
            await sendPushFn({
              token: userPrefs.token,
              title: notification.title,
              body: notification.body,
              data: {
                type: notification.type,
                relatedId: notification.relatedId || '',
                link: notification.link || '',
                ...notification.data
              },
            });
          }
        } catch (pushError) {
          // Fail silently if push notification can't be sent
          console.error('Failed to send push notification:', pushError);
        }
      }
      
      return docRef.id;
    } catch (error) {
      handleApiError(error, 'Failed to create notification.');
      throw error;
    }
  },
  
  // Get all notifications for a user
  getUserNotifications: async (userId: string, limitCount: number = 20, lastVisible?: QueryDocumentSnapshot): Promise<{notifications: Notification[], lastVisible?: QueryDocumentSnapshot}> => {
    try {
      // Create query for user's notifications, ordered by creation time
      let notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      // Apply pagination if we have a last visible document
      if (lastVisible) {
        notificationsQuery = query(notificationsQuery, startAfter(lastVisible));
      }
      
      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as Notification);
      
      // Return both the notifications and the last visible document for pagination
      return {
        notifications,
        lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : undefined
      };
    } catch (error) {
      handleApiError(error, `Failed to fetch notifications for user ${userId}.`);
      throw error;
    }
  },
  
  // Get count of unread notifications for a user
  getUnreadNotificationCount: async (userId: string): Promise<number> => {
    try {
      const unreadQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      
      const snapshot = await getDocs(unreadQuery);
      return snapshot.size;
    } catch (error) {
      handleApiError(error, `Failed to fetch unread notification count for user ${userId}.`);
      throw error;
    }
  },
  
  // Mark a notification as read
  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true
      });
    } catch (error) {
      handleApiError(error, `Failed to mark notification ${notificationId} as read.`);
      throw error;
    }
  },
  
  // Mark all notifications as read for a user
  markAllNotificationsAsRead: async (userId: string): Promise<void> => {
    try {
      const batch = writeBatch(db);
      
      // Get all unread notifications for the user
      const unreadQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      
      const snapshot = await getDocs(unreadQuery);
      
      // Mark each notification as read in a batch
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });
      
      await batch.commit();
    } catch (error) {
      handleApiError(error, `Failed to mark all notifications as read for user ${userId}.`);
      throw error;
    }
  },
  
  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      handleApiError(error, `Failed to delete notification ${notificationId}.`);
      throw error;
    }
  },
  
  // Get or create user notification preferences
  getUserNotificationPreferences: async (userId: string): Promise<NotificationPreferences> => {
    try {
      const prefsRef = doc(db, 'notificationPreferences', userId);
      const snapshot = await getDoc(prefsRef);
      
      if (snapshot.exists()) {
        return { userId, ...snapshot.data() } as NotificationPreferences;
      } else {
        // Create default preferences if none exist
        const defaultPrefs: NotificationPreferences = {
          userId,
          email: true,
          push: true,
          courseUpdates: true,
          newMessages: true,
          forumReplies: true,
          reminders: true,
          announcements: true,
          marketing: false
        };
        
        await setDoc(prefsRef, defaultPrefs);
        return defaultPrefs;
      }
    } catch (error) {
      handleApiError(error, `Failed to fetch notification preferences for user ${userId}.`);
      throw error;
    }
  },
  
  // Update user notification preferences
  updateNotificationPreferences: async (userId: string, preferences: Partial<NotificationPreferences>): Promise<void> => {
    try {
      const prefsRef = doc(db, 'notificationPreferences', userId);
      await updateDoc(prefsRef, preferences);
    } catch (error) {
      handleApiError(error, `Failed to update notification preferences for user ${userId}.`);
      throw error;
    }
  },
  
  // Register a device for FCM push notifications
  registerDeviceForPushNotifications: async (userId: string): Promise<void> => {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') return;
      
      const messaging = getMessaging();
      // Request permission first
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Get the token
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });
        
        if (token) {
          // Save the token to the user's notification preferences
          const prefsRef = doc(db, 'notificationPreferences', userId);
          await updateDoc(prefsRef, { token, push: true });
          
          // Set up foreground message handler
          onMessage(messaging, (payload) => {
            console.log('Message received in foreground:', payload);
            
            // Display the notification using the Notification API if we're in the foreground
            if (payload.notification) {
              const { title, body } = payload.notification;
              new Notification(title as string, {
                body: body as string,
                icon: '/favicon.ico'
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to register device for push notifications:', error);
      // Don't throw here, just log the error - push notification failure shouldn't break the app
    }
  }
};

export default notificationApi;