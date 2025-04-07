import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface UserClaims {
  role: string[];
  permissions?: string[];
}

export const createUser = functions.auth.user().onCreate(async (user) => {
  try {
    // Create default user profile
    await db.collection("users").doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      roles: ["student"], // Default role
      isActive: true,
      settings: {
        notifications: true,
        emailUpdates: true,
        language: "en",
      },
    });

    // Set custom claims for default role
    await admin.auth().setCustomUserClaims(user.uid, {
      roles: ["student"],
      permissions: getDefaultPermissions("student"),
    });

  } catch (error) {
    functions.logger.error("Error creating user:", error);
  }
});

export const updateUserRole = functions.https.onCall(async (data, context) => {
  // Verify admin permissions
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated to update roles"
    );
  }

  const adminUser = await db.collection("users").doc(context.auth.uid).get();
  if (!adminUser.data()?.roles?.includes("admin")) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to update roles"
    );
  }

  const { userId, newRoles } = data;

  try {
    // Update user document
    await db.collection("users").doc(userId).update({
      roles: newRoles,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update custom claims
    await admin.auth().setCustomUserClaims(userId, {
      roles: newRoles,
      permissions: getDefaultPermissions(newRoles[0]),
    });

    // Log role change
    await db.collection("userAuditLogs").add({
      userId,
      action: "role_update",
      oldRoles: (await admin.auth().getUser(userId)).customClaims?.roles || [],
      newRoles,
      updatedBy: context.auth.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: "User roles updated successfully" };
  } catch (error) {
    functions.logger.error("Error updating user role:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to update user role",
      { originalError: error instanceof Error ? error.message : "Unknown error" }
    );
  }
});

export const deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated to delete user"
    );
  }

  const { userId } = data;

  // Only allow users to delete their own accounts or admins to delete any account
  const isAdmin = (await db.collection("users").doc(context.auth.uid).get()).data()?.roles?.includes("admin");
  if (!isAdmin && context.auth.uid !== userId) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Not authorized to delete this user"
    );
  }

  try {
    // Delete auth user
    await admin.auth().deleteUser(userId);

    // Delete user data
    await db.collection("users").doc(userId).delete();

    // Clean up user-related data
    await cleanupUserData(userId);

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    functions.logger.error("Error deleting user:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete user",
      { originalError: error instanceof Error ? error.message : "Unknown error" }
    );
  }
});

export const handleUserStatusChange = functions.database
  .ref("/status/{uid}")
  .onWrite(async (change, context) => {
    const { uid } = context.params;
    const status = change.after.val();

    try {
      // Update user's online status in Firestore
      await db.collection("users").doc(uid).update({
        isOnline: status.state === "online",
        lastSeen: status.last_changed,
      });

      // Handle any active sessions
      if (status.state === "offline") {
        await handleUserOffline(uid);
      }
    } catch (error) {
      functions.logger.error("Error updating user status:", error);
    }
});

async function handleUserOffline(userId: string) {
  // Find active sessions for user
  const activeSessions = await db
    .collection("liveSessions")
    .where("participants", "array-contains", userId)
    .where("status", "==", "active")
    .get();

  // Update sessions if user was presenter
  const updatePromises = activeSessions.docs.map(async (session) => {
    const data = session.data();
    if (data.presenterId === userId) {
      await session.ref.update({
        status: "paused",
        lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

  await Promise.all(updatePromises);
}

async function cleanupUserData(userId: string) {
  const batch = db.batch();

  // Clean up user's posts
  const posts = await db
    .collectionGroup("posts")
    .where("authorId", "==", userId)
    .get();
  posts.forEach((post) => batch.delete(post.ref));

  // Clean up user's comments
  const comments = await db
    .collectionGroup("comments")
    .where("authorId", "==", userId)
    .get();
  comments.forEach((comment) => batch.delete(comment.ref));

  // Clean up notifications
  const notifications = await db
    .collection("notifications")
    .where("userId", "==", userId)
    .get();
  notifications.forEach((notif) => batch.delete(notif.ref));

  await batch.commit();
}

function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case "admin":
      return [
        "manage_users",
        "manage_content",
        "manage_courses",
        "moderate_forums",
        "view_analytics",
      ];
    case "teacher":
      return [
        "create_courses",
        "manage_own_courses",
        "grade_assignments",
        "moderate_forums",
      ];
    case "student":
      return [
        "enroll_courses",
        "submit_assignments",
        "participate_forums",
        "join_sessions",
      ];
    default:
      return ["view_public_content"];
  }
}
