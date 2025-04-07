import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Create notification when a new message is received in private chat
export const createMessageNotification = functions.firestore
    .document('chatRooms/{roomId}/messages/{messageId}')
    .onCreate(async (snapshot, context) => {
        try {
            const messageData = snapshot.data();
            const { roomId } = context.params;
            const sender = messageData.sender;
            const message = messageData.message;
            const recipientId = roomId.split('_')[1]; // Assumes format: user1_user2
            
            // Don't notify about your own messages
            if (recipientId === sender) return null;
            
            const senderProfile = await admin.firestore()
                .collection('users')
                .doc(sender)
                .get();
            
            if (!senderProfile.exists) return null;
            
            const senderName = senderProfile.data()?.displayName || 'Someone';
            
            const prefSnapshot = await admin.firestore()
                .collection('notificationPreferences')
                .doc(recipientId)
                .get();
            
            if (prefSnapshot.exists && prefSnapshot.data()?.newMessages === false) {
                return null;
            }
            
            const notificationData = {
                userId: recipientId,
                title: 'New Message',
                body: `${senderName}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
                type: 'chat',
                relatedId: roomId,
                isRead: false,
                requiresAction: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                link: `/chat/private/${sender}`,
                data: { sender, messageId: context.params.messageId }
            };
            
            await admin.firestore()
                .collection('notifications')
                .add(notificationData);
            
            if (prefSnapshot.exists && prefSnapshot.data()?.push && prefSnapshot.data()?.token) {
                await admin.messaging().send({
                    token: prefSnapshot.data()?.token,
                    notification: {
                        title: 'New Message',
                        body: `${senderName}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`
                    },
                    data: {
                        type: 'chat',
                        roomId,
                        sender,
                        link: `/chat/private/${sender}`
                    },
                    webpush: {
                        fcmOptions: {
                            link: `/chat/private/${sender}`
                        }
                    }
                });
            }
            
            return null;
        } catch (error) {
            console.error('Error creating message notification:', error);
            return null;
        }
    });

// Create notification when a new post is added to a thread
export const createThreadReplyNotification = functions.firestore
    .document('forums/{forumId}/threads/{threadId}/posts/{postId}')
    .onCreate(async (snapshot, context) => {
        try {
            const postData = snapshot.data();
            const { forumId, threadId } = context.params;
            const { content, author } = postData;
            
            const threadRef = admin.firestore().collection('forums').doc(forumId).collection('threads').doc(threadId);
            const threadSnapshot = await threadRef.get();
            
            if (!threadSnapshot.exists) return null;
            
            const threadData = threadSnapshot.data()!;
            const threadAuthor = threadData.createdBy;
            const threadTitle = threadData.title || 'Thread';
            
            if (threadAuthor === author) return null;
            
            const authorProfile = await admin.firestore()
                .collection('users')
                .doc(author)
                .get();
            
            if (!authorProfile.exists) return null;
            
            const authorName = authorProfile.data()?.displayName || 'Someone';
            
            const prefSnapshot = await admin.firestore()
                .collection('notificationPreferences')
                .doc(threadAuthor)
                .get();
            
            if (prefSnapshot.exists && prefSnapshot.data()?.forumReplies === false) {
                return null;
            }
            
            const notificationData = {
                userId: threadAuthor,
                title: 'New Reply in Thread',
                body: `${authorName} replied to your thread "${threadTitle}": ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
                type: 'forum',
                relatedId: `${forumId}/${threadId}`,
                isRead: false,
                requiresAction: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                link: `/forums/${forumId}/thread/${threadId}`,
                data: { author, postId: context.params.postId }
            };
            
            await admin.firestore()
                .collection('notifications')
                .add(notificationData);
            
            if (prefSnapshot.exists && prefSnapshot.data()?.push && prefSnapshot.data()?.token) {
                await admin.messaging().send({
                    token: prefSnapshot.data()?.token,
                    notification: {
                        title: 'New Reply in Thread',
                        body: `${authorName} replied to "${threadTitle}"`
                    },
                    data: {
                        type: 'forum',
                        forumId,
                        threadId,
                        link: `/forums/${forumId}/thread/${threadId}`
                    },
                    webpush: {
                        fcmOptions: {
                            link: `/forums/${forumId}/thread/${threadId}`
                        }
                    }
                });
            }
            
            return null;
        } catch (error) {
            console.error('Error creating thread reply notification:', error);
            return null;
        }
    });

// Create notifications when a course is updated
export const createCourseUpdateNotification = functions.firestore
    .document('courses/{courseId}')
    .onUpdate(async (change, context) => {
        try {
            const afterData = change.after.data();
            const beforeData = change.before.data();
            const courseId = context.params.courseId;
            
            // Only notify if important fields changed
            if (afterData.title === beforeData.title &&
                afterData.description === beforeData.description &&
                JSON.stringify(afterData.modules) === JSON.stringify(beforeData.modules)) {
                return null;
            }
            
            const enrollmentsSnapshot = await admin.firestore()
                .collection('enrollments')
                .where('courseId', '==', courseId)
                .get();
            
            if (enrollmentsSnapshot.empty) return null;
            
            const batch = admin.firestore().batch();
            
            for (const enrollmentDoc of enrollmentsSnapshot.docs) {
                const studentId = enrollmentDoc.data().studentId;
                
                const prefSnapshot = await admin.firestore()
                    .collection('notificationPreferences')
                    .doc(studentId)
                    .get();
                
                if (!prefSnapshot.exists || prefSnapshot.data()?.courseUpdates !== false) {
                    const notificationData = {
                        userId: studentId,
                        title: 'Course Updated',
                        body: `The course "${afterData.title}" has been updated`,
                        type: 'course',
                        relatedId: courseId,
                        isRead: false,
                        requiresAction: false,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        link: `/courses/${courseId}`,
                        data: { courseId }
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
                                title: 'Course Update',
                                body: `The course "${afterData.title}" has been updated`
                            },
                            data: {
                                type: 'course',
                                courseId,
                                link: `/courses/${courseId}`
                            },
                            webpush: {
                                fcmOptions: {
                                    link: `/courses/${courseId}`
                                }
                            }
                        }).catch(error => {
                            console.error('Error sending push notification:', error);
                        });
                    }
                }
            }
            
            await batch.commit();
            return null;
        } catch (error) {
            console.error('Error creating course update notifications:', error);
            return null;
        }
    });

// Create notifications for new course reviews
export const createReviewNotification = functions.firestore
    .document('courses/{courseId}/reviews/{reviewId}')
    .onCreate(async (snapshot, context) => {
        try {
            const reviewData = snapshot.data();
            const { courseId } = context.params;
            const { rating, content, reviewerId } = reviewData;
            
            const courseDoc = await admin.firestore()
                .collection('courses')
                .doc(courseId)
                .get();
            
            if (!courseDoc.exists) return null;
            
            const courseCreatorId = courseDoc.data()!.createdBy;
            const courseTitle = courseDoc.data()!.title || 'Course';
            
            if (courseCreatorId === reviewerId) return null;
            
            const reviewerProfile = await admin.firestore()
                .collection('users')
                .doc(reviewerId)
                .get();
            
            if (!reviewerProfile.exists) return null;
            
            const reviewerName = reviewerProfile.data()?.displayName || 'Someone';
            
            const prefSnapshot = await admin.firestore()
                .collection('notificationPreferences')
                .doc(courseCreatorId)
                .get();
            
            if (prefSnapshot.exists && prefSnapshot.data()?.courseReviews === false) {
                return null;
            }
            
            const reviewPreview = content 
                ? `${content.substring(0, 100)}${content.length > 100 ? '...' : ''}` 
                : `Rating: ${rating}/5`;
            
            const notificationData = {
                userId: courseCreatorId,
                title: 'New Course Review',
                body: `${reviewerName} left a review for "${courseTitle}": ${reviewPreview}`,
                type: 'review',
                relatedId: snapshot.id,
                courseId,
                isRead: false,
                requiresAction: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                link: `/courses/${courseId}/reviews`,
                data: { reviewId: snapshot.id, rating }
            };
            
            await admin.firestore()
                .collection('notifications')
                .add(notificationData);
            
            if (prefSnapshot.exists && prefSnapshot.data()?.push && prefSnapshot.data()?.token) {
                await admin.messaging().send({
                    token: prefSnapshot.data()?.token,
                    notification: {
                        title: 'New Course Review',
                        body: `${reviewerName} left a ${rating}-star review for "${courseTitle}"`
                    },
                    data: {
                        type: 'review',
                        courseId,
                        reviewId: snapshot.id,
                        link: `/courses/${courseId}/reviews`
                    },
                    webpush: {
                        fcmOptions: {
                            link: `/courses/${courseId}/reviews`
                        }
                    }
                });
            }
            
            return null;
        } catch (error) {
            console.error('Error creating review notification:', error);
            return null;
        }
    });

// Create notifications for new live session scheduling
export const onLiveSessionScheduled = functions.firestore
    .document('liveSessions/{sessionId}')
    .onCreate(async (snapshot, context) => {
        const sessionData = snapshot.data() as LiveSession;
        const courseRef = admin.firestore().collection('courses').doc(sessionData.courseId);
        
        // Get all enrolled students
        const enrollmentsSnapshot = await admin.firestore()
            .collection('enrollments')
            .where('courseId', '==', sessionData.courseId)
            .get();
            
        // Create notifications for each student
        const batch = admin.firestore().batch();
        enrollmentsSnapshot.forEach(doc => {
            const studentId = doc.data().userId;
            batch.set(admin.firestore().collection('notifications').doc(), {
                userId: studentId,
                type: 'SESSION_SCHEDULED',
                title: 'New Live Session',
                message: `A new live session for ${sessionData.title} has been scheduled`,
                courseId: sessionData.courseId,
                sessionId: snapshot.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                read: false
            });
        });
        
        return batch.commit();
    });