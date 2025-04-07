import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createNotification } from "./handlers";

const db = admin.firestore();

// Scheduled function to send reminders for upcoming schedules
export const createScheduleReminders = functions.pubsub
    .schedule('every 15 minutes')
    .onRun(async (context) => {
        try {
            const now = admin.firestore.Timestamp.now();
            const inOneHour = new admin.firestore.Timestamp(
                now.seconds + 60 * 60, 
                now.nanoseconds
            );
            
            const upcomingSchedulesSnapshot = await admin.firestore()
                .collection('schedules')
                .where('startTime', '>=', now)
                .where('startTime', '<=', inOneHour)
                .where('reminderSent', '==', false)
                .get();
            
            if (upcomingSchedulesSnapshot.empty) return null;
            
            const batch = admin.firestore().batch();
            
            for (const scheduleDoc of upcomingSchedulesSnapshot.docs) {
                const schedule = scheduleDoc.data();
                batch.update(scheduleDoc.ref, { reminderSent: true });
                
                const attendees = schedule.attendees || [];
                if (!attendees.length) continue;
                
                const startTime = schedule.startTime.toDate();
                const formattedTime = startTime.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                });
                
                for (const attendeeId of attendees) {
                    const prefSnapshot = await admin.firestore()
                        .collection('notificationPreferences')
                        .doc(attendeeId)
                        .get();
                    
                    if (!prefSnapshot.exists || prefSnapshot.data()?.reminders !== false) {
                        const notificationData = {
                            userId: attendeeId,
                            title: 'Upcoming Schedule',
                            body: `Reminder: "${schedule.title}" starts at ${formattedTime}`,
                            type: 'schedule',
                            relatedId: scheduleDoc.id,
                            isRead: false,
                            requiresAction: true,
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            link: `/schedule/${scheduleDoc.id}`,
                            data: { scheduleId: scheduleDoc.id }
                        };
                        
                        const newNotificationRef = admin.firestore()
                            .collection('notifications')
                            .doc();
                        batch.set(newNotificationRef, notificationData);
                        
                        if (prefSnapshot.exists && 
                            prefSnapshot.data()?.push && 
                            prefSnapshot.data()?.token) {
                            const token = prefSnapshot.data()?.token;
                            
                            await admin.messaging().send({
                                token,
                                notification: {
                                    title: 'Upcoming Schedule Reminder',
                                    body: `"${schedule.title}" starts at ${formattedTime}`
                                },
                                data: {
                                    type: 'schedule',
                                    scheduleId: scheduleDoc.id,
                                    link: `/schedule/${scheduleDoc.id}`
                                },
                                webpush: {
                                    fcmOptions: {
                                        link: `/schedule/${scheduleDoc.id}`
                                    }
                                }
                            }).catch(error => {
                                console.error('Error sending push notification:', error);
                            });
                        }
                    }
                }
            }
            
            await batch.commit();
            return null;
        } catch (error) {
            console.error('Error sending schedule reminders:', error);
            return null;
        }
    });

// Scheduled function to clean up invalid tokens
export const cleanupInvalidTokens = functions
    .runWith({
        timeoutSeconds: 300,
        memory: '512MB'
    })
    .pubsub.schedule('every 24 hours')
    .onRun(async () => {
        functions.logger.info('Starting invalid token cleanup process');
        
        try {
            const invalidTokensSnapshot = await admin.firestore()
                .collection('invalidTokens')
                .where('processed', '==', false)
                .limit(1000)
                .get();
            
            if (invalidTokensSnapshot.empty) {
                functions.logger.info('No invalid tokens to process');
                return null;
            }
            
            const tokensToRemove = invalidTokensSnapshot.docs.map(doc => ({
                id: doc.id,
                token: doc.data().token
            }));
            
            const batch = admin.firestore().batch();
            let removedCount = 0;
            let processedTokenDocs = 0;
            
            for (const { id, token } of tokensToRemove) {
                batch.update(admin.firestore().collection('invalidTokens').doc(id), {
                    processed: true,
                    processedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                processedTokenDocs++;
                
                const usersWithTokenSnapshot = await admin.firestore()
                    .collection('users')
                    .where('notificationTokens', 'array-contains', token)
                    .get();
                
                usersWithTokenSnapshot.forEach(userDoc => {
                    const userData = userDoc.data();
                    if (userData.notificationTokens && Array.isArray(userData.notificationTokens)) {
                        const updatedTokens = userData.notificationTokens.filter(t => t !== token);
                        batch.update(userDoc.ref, { notificationTokens: updatedTokens });
                        removedCount++;
                    }
                });
                
                if (processedTokenDocs >= 400) {
                    await batch.commit();
                    functions.logger.info(`Committed batch of ${processedTokenDocs} processed tokens`);
                    processedTokenDocs = 0;
                }
            }
            
            if (processedTokenDocs > 0) {
                await batch.commit();
                functions.logger.info(`Committed final batch of ${processedTokenDocs} processed tokens`);
            }
            
            functions.logger.info(`Token cleanup complete. Removed ${removedCount} invalid tokens`);
            
            return { success: true, tokensProcessed: tokensToRemove.length, tokensRemoved: removedCount };
            
        } catch (error: any) {
            functions.logger.error('Error cleaning up invalid tokens', { error: error.message });
            return { success: false, error: error.message };
        }
    });

// Check for upcoming assignment deadlines
export const checkAssignmentDeadlines = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const twentyFourHoursFromNow = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 24 * 60 * 60 * 1000
    );

    try {
      // Find assignments due in the next 24 hours
      const assignments = await db
        .collectionGroup("assignments")
        .where("dueDate", ">", now)
        .where("dueDate", "<=", twentyFourHoursFromNow)
        .get();

      const notificationPromises = assignments.docs.map(async (doc) => {
        const assignment = doc.data();
        const courseRef = doc.ref.parent.parent;
        if (!courseRef) return;

        const course = (await courseRef.get()).data();
        if (!course) return;

        // Get enrolled students who haven't submitted
        const enrolledStudents = await db
          .collection("enrollments")
          .where("courseId", "==", courseRef.id)
          .where("status", "==", "active")
          .get();

        const submittedStudents = new Set(
          (await doc.ref.collection("submissions").get()).docs.map(
            (sub) => sub.data().userId
          )
        );

        // Send notifications to students who haven't submitted
        const studentNotifications = enrolledStudents.docs
          .filter((enrollment) => !submittedStudents.has(enrollment.data().userId))
          .map((enrollment) =>
            createNotification({
              userId: enrollment.data().userId,
              type: "assignment",
              title: "Assignment Due Soon",
              message: `Your assignment "${assignment.title}" for ${course.title} is due in less than 24 hours`,
              metadata: {
                courseId: courseRef.id,
                assignmentId: doc.id,
                dueDate: assignment.dueDate,
                courseName: course.title,
                assignmentName: assignment.title,
              },
              link: `/courses/${courseRef.id}/assignments/${doc.id}`,
            })
          );

        await Promise.all(studentNotifications);
      });

      await Promise.all(notificationPromises);
    } catch (error) {
      functions.logger.error("Error checking assignment deadlines:", error);
    }
  });

// Check for upcoming live sessions
export const checkUpcomingSessions = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const oneHourFromNow = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 60 * 60 * 1000
    );

    try {
      // Find sessions starting in the next hour
      const sessions = await db
        .collection("liveSessions")
        .where("startTime", ">", now)
        .where("startTime", "<=", oneHourFromNow)
        .where("notifiedParticipants", "==", false)
        .get();

      const notificationPromises = sessions.docs.map(async (doc) => {
        const session = doc.data();
        const course = (await db.collection("courses").doc(session.courseId).get()).data();
        if (!course) return;

        // Get all enrolled students
        const enrolledStudents = await db
          .collection("enrollments")
          .where("courseId", "==", session.courseId)
          .where("status", "==", "active")
          .get();

        // Send notifications to enrolled students
        const studentNotifications = enrolledStudents.docs.map((enrollment) =>
          createNotification({
            userId: enrollment.data().userId,
            type: "live_session",
            title: "Live Session Starting Soon",
            message: `Live session for ${course.title} starts in less than an hour`,
            metadata: {
              sessionId: doc.id,
              courseId: session.courseId,
              startTime: session.startTime,
              hostName: session.hostName,
              courseName: course.title,
            },
            link: `/courses/${session.courseId}/live/${doc.id}`,
          })
        );

        await Promise.all(studentNotifications);

        // Mark session as notified
        await doc.ref.update({ notifiedParticipants: true });
      });

      await Promise.all(notificationPromises);
    } catch (error) {
      functions.logger.error("Error checking upcoming sessions:", error);
    }
  });

// Send weekly course progress reminders
export const sendProgressReminders = functions.pubsub
  .schedule("every monday 09:00")
  .timeZone("UTC")
  .onRun(async (context) => {
    try {
      // Get all active enrollments
      const enrollments = await db
        .collection("enrollments")
        .where("status", "==", "active")
        .get();

      const reminderPromises = enrollments.docs.map(async (doc) => {
        const enrollment = doc.data();
        const course = (await db.collection("courses").doc(enrollment.courseId).get()).data();
        if (!course) return;

        // Calculate progress
        const progress = await calculateCourseProgress(
          enrollment.courseId,
          enrollment.userId
        );

        // Only send reminder if progress is less than 100%
        if (progress < 100) {
          await createNotification({
            userId: enrollment.userId,
            type: "course_update",
            title: "Weekly Progress Reminder",
            message: `You've completed ${progress}% of ${course.title}. Keep up the good work!`,
            metadata: {
              courseId: enrollment.courseId,
              updateType: "progress",
              courseName: course.title,
            },
            link: `/courses/${enrollment.courseId}/progress`,
          });
        }
      });

      await Promise.all(reminderPromises);
    } catch (error) {
      functions.logger.error("Error sending progress reminders:", error);
    }
  });

async function calculateCourseProgress(
  courseId: string,
  userId: string
): Promise<number> {
  try {
    // Get course modules
    const modules = await db
      .collection("courses")
      .doc(courseId)
      .collection("modules")
      .get();

    if (modules.empty) return 0;

    // Get completed modules
    const completedModules = await db
      .collection("moduleProgress")
      .where("courseId", "==", courseId)
      .where("userId", "==", userId)
      .where("completed", "==", true)
      .get();

    return Math.round((completedModules.size / modules.size) * 100);
  } catch (error) {
    functions.logger.error("Error calculating course progress:", error);
    return 0;
  }
}