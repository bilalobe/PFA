import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Send a single push notification using FCM with retry mechanism
export const sendPushNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send notifications');
    }
    
    try {
        const { token, title, body, data: messageData } = data;
        const maxRetries = 3;
        
        if (!token || !title || !body) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
        }

        if (typeof token !== 'string' || token.length < 32) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid FCM token format');
        }
        
        const message: admin.messaging.Message = {
            token,
            notification: { title, body },
            data: messageData || {},
            webpush: {
                fcmOptions: { link: messageData?.link || '/' },
                notification: {
                    icon: '/favicon.ico',
                    badge: '/badge.png',
                    vibrate: [100, 50, 100],
                    requireInteraction: messageData?.requireInteraction || false,
                    actions: [{ action: 'view', title: 'View' }]
                },
                headers: { TTL: '86400' }
            },
            android: {
                priority: 'high',
                notification: {
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                    icon: 'notification_icon',
                    color: '#4285F4'
                }
            },
            apns: {
                payload: {
                    aps: {
                        badge: 1,
                        sound: 'default'
                    }
                }
            }
        };

        let lastError;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await admin.messaging().send(message);
                return { success: true, messageId: response };
            } catch (error: any) {
                lastError = error;
                
                if (error.code === 'messaging/invalid-argument' || 
                    error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    
                    functions.logger.warn('Invalid FCM token detected', { token, errorCode: error.code });
                    throw new functions.https.HttpsError('failed-precondition', 'Invalid or expired token');
                }
                
                if (attempt === maxRetries - 1) break;
                
                const delay = Math.pow(2, attempt) * 200 + Math.random() * 100;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw new functions.https.HttpsError('unavailable', 'Failed to send after retries',
            { originalError: lastError?.message || 'Unknown error' }
        );
    } catch (error: any) {
        functions.logger.error('Error in sendPushNotification:', {
            error: error.message || 'Unknown error',
            code: error.code,
            errorType: error instanceof functions.https.HttpsError ? 'HttpsError' : 'Unknown'
        });
        
        if (error instanceof functions.https.HttpsError) {
            throw error;
        } else {
            throw new functions.https.HttpsError('internal', 'Error sending notification',
                { originalError: error.message || 'Unknown error' }
            );
        }
    }
});

// Send notifications in batch with error handling and chunking
export const sendBatchNotifications = functions.runWith({
    timeoutSeconds: 540,
    memory: '1GB'
}).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    
    try {
        const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
        const userData = userDoc.data();
        if (!userData?.isAdmin && !userData?.roles?.includes('admin')) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
    } catch (error: any) {
        functions.logger.error('Error verifying admin status', { userId: context.auth.uid, error: error.message });
        throw new functions.https.HttpsError('permission-denied', 'Failed to verify admin status');
    }

    const { notifications, batchId = Date.now().toString() } = data;
    
    if (!Array.isArray(notifications) || notifications.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Empty notifications array');
    }
    
    const MAX_BATCH_SIZE = 500;
    if (notifications.length > MAX_BATCH_SIZE) {
        throw new functions.https.HttpsError('resource-exhausted', `Exceeds max batch size of ${MAX_BATCH_SIZE}`);
    }
    
    const CHUNK_SIZE = 100;
    const results = {
        successful: 0,
        failed: 0,
        errors: [] as any[],
        messageIds: [] as string[]
    };
    
    try {
        functions.logger.info(`Starting batch notification job ${batchId}`);
        
        for (let i = 0; i < notifications.length; i += CHUNK_SIZE) {
            const chunk = notifications.slice(i, i + CHUNK_SIZE);
            
            const messages = chunk.map(notif => {
                if (!notif.token || !notif.title || !notif.body) {
                    results.failed++;
                    results.errors.push({
                        error: 'Missing required fields',
                        notification: { 
                            title: notif.title || '[missing]', 
                            token: notif.token ? '[present]' : '[missing]' 
                        }
                    });
                    return null;
                }
                
                return {
                    token: notif.token,
                    notification: {
                        title: notif.title,
                        body: notif.body
                    },
                    data: notif.data || {},
                    webpush: {
                        fcmOptions: { link: notif.data?.link || '/' },
                        notification: {
                            icon: '/favicon.ico',
                            badge: '/badge.png'
                        }
                    }
                };
            }).filter(Boolean) as admin.messaging.Message[];
            
            if (messages.length === 0) continue;
            
            const MAX_RETRIES = 3;
            let attempt = 0;
            let success = false;
            
            while (attempt < MAX_RETRIES && !success) {
                try {
                    if (attempt > 0) {
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
                    }
                    
                    const batchResponse = await admin.messaging().sendEach(messages);
                    results.successful += batchResponse.successCount;
                    results.failed += batchResponse.failureCount;
                    
                    batchResponse.responses.forEach((resp, idx) => {
                        if (resp.success) {
                            results.messageIds.push(resp.messageId);
                        } else {
                            results.errors.push({
                                error: resp.error?.message,
                                code: resp.error?.code,
                                token: messages[idx].token?.substring(0, 10) + '...'
                            });
                            
                            if (resp.error?.code === 'messaging/invalid-registration-token' || 
                                resp.error?.code === 'messaging/registration-token-not-registered') {
                                const token = messages[idx].token;
                                if (token) {
                                    admin.firestore().collection('invalidTokens').doc().set({
                                        token,
                                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                        error: resp.error?.code
                                    }).catch(err => {
                                        functions.logger.error('Error storing invalid token', { error: err.message });
                                    });
                                }
                            }
                        }
                    });
                    
                    success = true;
                    
                } catch (error: any) {
                    attempt++;
                    if (attempt >= MAX_RETRIES) {
                        functions.logger.error(`Chunk ${Math.floor(i / CHUNK_SIZE) + 1} failed after ${MAX_RETRIES} attempts`);
                        results.failed += messages.length;
                        results.errors.push({
                            error: error.message,
                            chunkIndex: Math.floor(i / CHUNK_SIZE),
                            affectedMessages: messages.length
                        });
                    }
                }
            }
        }
        
        await admin.firestore().collection('notificationJobs').doc(batchId).set({
            completed: true,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            results: {
                successful: results.successful,
                failed: results.failed,
                totalErrors: results.errors.length,
                errors: results.errors.slice(0, 20)
            },
            initiatedBy: context.auth.uid
        });
        
        return {
            success: true,
            batchId,
            successCount: results.successful,
            failureCount: results.failed,
            errors: results.errors.length > 20 
                ? [...results.errors.slice(0, 20), { message: `${results.errors.length - 20} additional errors omitted` }] 
                : results.errors
        };
        
    } catch (error: any) {
        functions.logger.error('Error in batch notifications', { 
            error: error.message, 
            batchId,
            notifications: notifications.length
        });
        
        await admin.firestore().collection('notificationJobs').doc(batchId).set({
            completed: false,
            error: error.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            results: results,
            initiatedBy: context.auth.uid
        });
        
        throw new functions.https.HttpsError('internal', 'Error processing batch notifications', { 
            originalError: error.message,
            partialResults: results
        });
    }
});