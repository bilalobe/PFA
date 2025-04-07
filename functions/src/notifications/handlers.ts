import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: FirebaseFirestore.FieldValue;
}

export const createNotification = async (data: Omit<NotificationData, "read" | "createdAt">) => {
  const notification: NotificationData = {
    ...data,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    // Store notification in Firestore
    const docRef = await db.collection("notifications").add(notification);

    // Get user's FCM tokens
    const userDoc = await db.collection("users").doc(data.userId).get();
    const fcmTokens = userDoc.data()?.fcmTokens || [];

    if (fcmTokens.length > 0) {
      // Send push notification
      const message = {
        notification: {
          title: data.title,
          body: data.message,
        },
        data: {
          type: data.type,
          link: data.link || "",
          notificationId: docRef.id,
        },
        tokens: fcmTokens,
      };

      const response = await admin.messaging().sendMulticast(message);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens = response.responses
          .map((resp, idx) => (resp.success ? null : fcmTokens[idx]))
          .filter(Boolean);

        if (invalidTokens.length > 0) {
          await removeInvalidTokens(data.userId, invalidTokens as string[]);
        }
      }
    }

    return docRef.id;
  } catch (error) {
    functions.logger.error("Error creating notification:", error);
    throw error;
  }
};

export const markNotificationRead = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated to mark notifications as read"
    );
  }

  const { notificationId } = data;

  try {
    const notifRef = db.collection("notifications").doc(notificationId);
    const notif = await notifRef.get();

    if (!notif.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Notification not found"
      );
    }

    // Verify user owns the notification
    if (notif.data()?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Cannot mark another user's notification as read"
      );
    }

    await notifRef.update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    functions.logger.error("Error marking notification as read:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to mark notification as read",
      { originalError: error instanceof Error ? error.message : "Unknown error" }
    );
  }
});

export const registerFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated to register FCM token"
    );
  }

  const { token } = data;

  if (!token || typeof token !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Token must be a non-empty string"
    );
  }

  try {
    await db.collection("users").doc(context.auth.uid).update({
      fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
    });

    return { success: true };
  } catch (error) {
    functions.logger.error("Error registering FCM token:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to register FCM token"
    );
  }
});

export const unregisterFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated to unregister FCM token"
    );
  }

  const { token } = data;

  try {
    await db.collection("users").doc(context.auth.uid).update({
      fcmTokens: admin.firestore.FieldValue.arrayRemove(token),
    });

    return { success: true };
  } catch (error) {
    functions.logger.error("Error unregistering FCM token:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to unregister FCM token"
    );
  }
});

async function removeInvalidTokens(userId: string, invalidTokens: string[]) {
  try {
    await db.collection("users").doc(userId).update({
      fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
    });
  } catch (error) {
    functions.logger.error("Error removing invalid tokens:", error);
  }
}

// Cleanup old notifications periodically
export const cleanupOldNotifications = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    try {
      const oldNotifications = await db
        .collection("notifications")
        .where("createdAt", "<", thirtyDaysAgo)
        .where("read", "==", true)
        .get();

      const batch = db.batch();
      oldNotifications.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      functions.logger.info(
        `Cleaned up ${oldNotifications.size} old notifications`
      );
    } catch (error) {
      functions.logger.error("Error cleaning up old notifications:", error);
    }
});