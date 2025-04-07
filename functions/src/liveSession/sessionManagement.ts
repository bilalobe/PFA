import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from '../firebaseConfig';
import { LiveSession, LiveSessionPoll, LiveSessionPollOption } from '../../src/interfaces/types'; // Adjust path if needed
import * as z from 'zod';

// Schema for creating a live session
const CreateSessionSchema = z.object({
  courseId: z.string(),
  title: z.string().min(3),
  description: z.string().min(10),
  scheduledStart: z.number(), // timestamp
  expectedDuration: z.number().min(5).max(180), // minutes
  maxParticipants: z.number().optional(),
  features: z.object({
    videoEnabled: z.boolean().default(true),
    chatEnabled: z.boolean().default(true),
    screenShareEnabled: z.boolean().default(true),
    recordingEnabled: z.boolean().default(false),
    interactivePolls: z.boolean().default(false),
  }).optional()
});

// Helper to check if user is the session host
const isSessionHost = async (sessionId: string, userId: string): Promise<boolean> => {
  const sessionRef = db.collection('liveSessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();
  if (!sessionDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Live session not found.');
  }
  const sessionData = sessionDoc.data() as LiveSession;
  return sessionData.hostId === userId;
};

// Helper to check if user is enrolled in the course associated with the session
const isEnrolledInCourse = async (sessionId: string, userId: string): Promise<boolean> => {
  const sessionRef = db.collection('liveSessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();
  if (!sessionDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Live session not found.');
  }
  const sessionData = sessionDoc.data() as LiveSession;
  const courseId = sessionData.courseId;

  // Assuming enrollment ID format is `${courseId}_${userId}` - adjust if different
  const enrollmentRef = db.collection('enrollments').doc(`${courseId}_${userId}`);
  const enrollmentDoc = await enrollmentRef.get();
  return enrollmentDoc.exists;
};

/**
 * Creates a new live learning session
 */
export const createLiveSession = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    // Validate input data
    const validatedData = CreateSessionSchema.parse(data);
    
    // Ensure user is authorized to create sessions for this course
    const courseRef = db.collection('courses').doc(validatedData.courseId);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Course not found');
    }
    
    // Check if user is instructor or has teacher role
    const isInstructor = courseDoc.data()?.instructor === context.auth.uid;
    const userRef = await db.collection('users').doc(context.auth.uid).get();
    const isTeacher = userRef.data()?.roles?.includes('teacher') || false;
    
    if (!isInstructor && !isTeacher) {
      throw new functions.https.HttpsError('permission-denied', 'Only instructors can create live sessions');
    }
    
    // Generate a unique session code
    const sessionCode = generateUniqueCode();
    
    // Create the session
    const sessionData = {
      ...validatedData,
      createdBy: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'scheduled', // scheduled, active, completed, cancelled
      sessionCode,
      participants: [],
      actualStart: null,
      actualEnd: null,
      recordingUrl: null
    };
    
    const sessionRef = await db.collection('liveSessions').add(sessionData);
    
    // Notify enrolled students about the new session
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('courseId', '==', validatedData.courseId)
      .get();
    
    const batch = db.batch();
    
    enrollmentsSnapshot.forEach(enrollmentDoc => {
      const studentId = enrollmentDoc.data().studentId;
      
      // Add notification
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        userId: studentId,
        title: 'New Live Session Scheduled',
        body: `A new live session "${validatedData.title}" has been scheduled for your course "${courseDoc.data()?.title}"`,
        type: 'liveSession',
        relatedId: sessionRef.id,
        courseId: validatedData.courseId,
        isRead: false,
        requiresAction: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        link: `/courses/${validatedData.courseId}/live-sessions/${sessionRef.id}`,
        data: {
          scheduledStart: validatedData.scheduledStart,
          sessionCode
        }
      });
    });
    
    await batch.commit();
    
    // Return the session details
    return {
      sessionId: sessionRef.id,
      sessionCode,
      ...sessionData
    };
    
  } catch (error) {
    console.error('Error creating live session:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create live session');
  }
});

/**
 * Updates a session's status (start, end, cancel)
 */
export const updateSessionStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { sessionId, status } = data;
  
  if (!sessionId || !['active', 'completed', 'cancelled'].includes(status)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid session ID or status');
  }
  
  try {
    const sessionRef = db.collection('liveSessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();
    
    if (!sessionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Session not found');
    }
    
    const sessionData = sessionDoc.data();
    
    // Only the creator can update session status
    if (sessionData?.createdBy !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only the session creator can update its status');
    }
    
    const updateData: any = { status };
    
    // Add timestamps based on status
    if (status === 'active' && !sessionData?.actualStart) {
      updateData.actualStart = admin.firestore.FieldValue.serverTimestamp();
    } else if (status === 'completed') {
      updateData.actualEnd = admin.firestore.FieldValue.serverTimestamp();
    }
    
    await sessionRef.update(updateData);
    
    return { success: true, sessionId, status };
    
  } catch (error) {
    console.error('Error updating session status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update session status');
  }
});

/**
 * Join a live session using code or direct link
 */
export const joinLiveSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const userId = context.auth.uid;
  const { sessionId } = data;

  if (!sessionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Session ID is required.');
  }

  // Check if user is enrolled (or host)
  const isHost = await isSessionHost(sessionId, userId);
  if (!isHost && !(await isEnrolledInCourse(sessionId, userId))) {
    throw new functions.https.HttpsError('permission-denied', 'User is not enrolled in the course for this session.');
  }

  const sessionRef = db.collection('liveSessions').doc(sessionId);
  const userProfileRef = db.collection('users').doc(userId);

  try {
    const userProfileSnap = await userProfileRef.get();
    if (!userProfileSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const displayName = userProfileSnap.data()?.displayName || 'Anonymous';

    const participantData = {
      userId: userId,
      displayName: displayName,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await sessionRef.update({
      participants: admin.firestore.FieldValue.arrayUnion(participantData),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    functions.logger.info(`User ${userId} joined session ${sessionId}`);
    return { success: true };
  } catch (error) {
    functions.logger.error(`Error joining session ${sessionId} for user ${userId}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to join live session.');
  }
});

export const leaveLiveSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const userId = context.auth.uid;
  const { sessionId } = data;

  if (!sessionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Session ID is required.');
  }

  const sessionRef = db.collection('liveSessions').doc(sessionId);

  try {
    // Fetch current participants to find the specific object to remove
    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Session not found.');
    }
    const sessionData = sessionDoc.data() as LiveSession;
    const currentParticipants = sessionData.participants || [];
    const participantToRemove = currentParticipants.find(p => p.userId === userId);

    if (participantToRemove) {
      await sessionRef.update({
        participants: admin.firestore.FieldValue.arrayRemove(participantToRemove),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      functions.logger.info(`User ${userId} left session ${sessionId}`);
    } else {
      functions.logger.warn(`User ${userId} tried to leave session ${sessionId} but was not found in participants list.`);
    }
    return { success: true };
  } catch (error) {
    functions.logger.error(`Error leaving session ${sessionId} for user ${userId}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to leave live session.');
  }
});

/**
 * Create a poll during a live session
 */
export const createLiveSessionPoll = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const userId = context.auth.uid;
  const { sessionId, question, options } = data; // options should be an array of strings

  if (!sessionId || !question || !Array.isArray(options) || options.length < 2) {
    throw new functions.https.HttpsError('invalid-argument', 'Session ID, question, and at least two options are required.');
  }

  if (!(await isSessionHost(sessionId, userId))) {
    throw new functions.https.HttpsError('permission-denied', 'Only the host can create polls.');
  }

  const sessionRef = db.collection('liveSessions').doc(sessionId);
  const pollsRef = sessionRef.collection('polls');

  try {
    const pollOptions: LiveSessionPollOption[] = options.map((text: string, index: number) => ({
      id: `opt_${index + 1}`, // Simple ID generation
      text: text,
      votes: 0,
    }));

    const newPollData: Omit<LiveSessionPoll, 'id'> = {
      question: question,
      options: pollOptions,
      isOpen: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const newPollRef = await pollsRef.add(newPollData);

    // Set this poll as the active one for the session
    await sessionRef.update({
      activePollId: newPollRef.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`Poll created for session ${sessionId} by ${userId}`);
    return { success: true, pollId: newPollRef.id };
  } catch (error) {
    functions.logger.error(`Error creating poll for session ${sessionId}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to create poll.');
  }
});

export const submitPollVote = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const userId = context.auth.uid;
  const { sessionId, pollId, optionId } = data;

  if (!sessionId || !pollId || !optionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Session ID, Poll ID, and Option ID are required.');
  }

  // Check if user is enrolled (or host)
  const isHost = await isSessionHost(sessionId, userId);
  if (!isHost && !(await isEnrolledInCourse(sessionId, userId))) {
    throw new functions.https.HttpsError('permission-denied', 'User is not part of this session.');
  }

  const pollRef = db.collection('liveSessions').doc(sessionId).collection('polls').doc(pollId);
  const voteRef = pollRef.collection('votes').doc(userId); // Store one vote per user

  try {
    await db.runTransaction(async (transaction) => {
      const pollDoc = await transaction.get(pollRef);
      const voteDoc = await transaction.get(voteRef);

      if (!pollDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Poll not found.');
      }

      const pollData = pollDoc.data() as LiveSessionPoll;
      if (!pollData.isOpen) {
        throw new functions.https.HttpsError('failed-precondition', 'This poll is closed.');
      }

      const previousVote = voteDoc.exists ? voteDoc.data()?.optionId : null;

      // If user hasn't voted before or is changing their vote
      if (previousVote !== optionId) {
        const newOptions = pollData.options.map(opt => {
          let newVotes = opt.votes;
          // Decrement previous vote if changing vote
          if (voteDoc.exists && opt.id === previousVote) {
            newVotes = Math.max(0, newVotes - 1);
          }
          // Increment new vote
          if (opt.id === optionId) {
            newVotes += 1;
          }
          return { ...opt, votes: newVotes };
        });

        // Update poll options with new vote counts
        transaction.update(pollRef, { options: newOptions });
        // Record the user's vote (or update it)
        transaction.set(voteRef, { optionId: optionId, votedAt: admin.firestore.FieldValue.serverTimestamp() });
      } else {
        // User is submitting the same vote again, do nothing or maybe throw an error?
        functions.logger.info(`User ${userId} submitted the same vote for poll ${pollId}`);
      }
    });

    functions.logger.info(`Vote submitted by ${userId} for poll ${pollId}, option ${optionId}`);
    return { success: true };
  } catch (error: any) {
    functions.logger.error(`Error submitting vote for poll ${pollId} by user ${userId}:`, error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to submit vote.');
  }
});

// --- Session Management Functions ---

export const startLiveSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const userId = context.auth.uid;
  const { sessionId } = data;

  if (!sessionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Session ID is required.');
  }

  if (!(await isSessionHost(sessionId, userId))) {
    throw new functions.https.HttpsError('permission-denied', 'Only the host can start the session.');
  }

  const sessionRef = db.collection('liveSessions').doc(sessionId);

  try {
    await sessionRef.update({
      status: 'live',
      actualStartTime: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    functions.logger.info(`Live session ${sessionId} started by ${userId}`);
    return { success: true };
  } catch (error) {
    functions.logger.error(`Error starting session ${sessionId}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to start live session.');
  }
});

export const endLiveSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const userId = context.auth.uid;
  const { sessionId } = data;

  if (!sessionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Session ID is required.');
  }

  if (!(await isSessionHost(sessionId, userId))) {
    throw new functions.https.HttpsError('permission-denied', 'Only the host can end the session.');
  }

  const sessionRef = db.collection('liveSessions').doc(sessionId);

  try {
    await sessionRef.update({
      status: 'ended',
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      activePollId: null, // Close any active poll
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Optionally: Archive polls or participant data here
    functions.logger.info(`Live session ${sessionId} ended by ${userId}`);
    return { success: true };
  } catch (error) {
    functions.logger.error(`Error ending session ${sessionId}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to end live session.');
  }
});

export const saveLiveSessionMaterials = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  
  const { sessionId, materials } = data;
  const sessionRef = db.collection('liveSessions').doc(sessionId);
  
  try {
    // Store materials and make them available for offline access
    await sessionRef.update({
      materials: materials,
      materialsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving session materials:', error);
    throw new functions.https.HttpsError('internal', 'Failed to save materials');
  }
});

// Helper functions
function generateUniqueCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function checkEnrollment(userId: string, courseId: string): Promise<boolean> {
  const enrollmentQuery = await db.collection('enrollments')
    .where('studentId', '==', userId)
    .where('courseId', '==', courseId)
    .limit(1)
    .get();
  
  return !enrollmentQuery.empty;
}

async function generateSessionToken(sessionId: string, userId: string): Promise<string> {
  // This would integrate with your video/conferencing service
  // For example, if using Twilio Video:
  // const token = generateTwilioToken(sessionId, userId);
  
  // Placeholder implementation:
  return `session-${sessionId}-${userId}-${Date.now()}`;
}