import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Map of sessionId to array of connected socket IDs
const sessionParticipants: Record<string, Set<string>> = {};

io.use(async (socket, next) => {
  const userId = socket.handshake.auth.userId;
  
  if (!userId) {
    return next(new Error('Authentication error'));
  }
  
  try {
    // Verify the user exists
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return next(new Error('User not found'));
    }
    
    // Store user info in socket for later use
    socket.data.userId = userId;
    socket.data.user = userDoc.data();
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket: Socket) => {
  const userId = socket.data.userId;
  console.log(`User connected: ${userId}`);
  
  // Handle joining a session
  socket.on('join_session', async ({ sessionId }) => {
    // Add socket to room
    socket.join(`session:${sessionId}`);
    
    // Track participants
    if (!sessionParticipants[sessionId]) {
      sessionParticipants[sessionId] = new Set();
    }
    sessionParticipants[sessionId].add(socket.id);
    
    // Update participant presence in Firestore
    try {
      const sessionRef = admin.firestore().collection('liveSessions').doc(sessionId);
      await sessionRef.update({
        [`participantsStatus.${userId}.online`]: true,
        [`participantsStatus.${userId}.lastActive`]: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating participant presence:', error);
    }
  });
  
  // Handle leaving a session
  socket.on('leave_session', async ({ sessionId }) => {
    socket.leave(`session:${sessionId}`);
    
    if (sessionParticipants[sessionId]) {
      sessionParticipants[sessionId].delete(socket.id);
    }
    
    // Update participant presence in Firestore
    try {
      const sessionRef = admin.firestore().collection('liveSessions').doc(sessionId);
      await sessionRef.update({
        [`participantsStatus.${userId}.online`]: false,
        [`participantsStatus.${userId}.lastActive`]: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating participant presence:', error);
    }
  });
  
  // Handle raise hand event
  socket.on('raise_hand', ({ sessionId }) => {
    io.to(`session:${sessionId}`).emit(`session:${sessionId}:raise_hand`, userId);
  });
  
  // Handle lower hand event
  socket.on('lower_hand', ({ sessionId }) => {
    io.to(`session:${sessionId}`).emit(`session:${sessionId}:lower_hand`, userId);
  });
  
  // Handle typing event
  socket.on('typing', ({ sessionId }) => {
    socket.to(`session:${sessionId}`).emit(`session:${sessionId}:typing`, userId);
  });
  
  // Handle presence updates
  socket.on('presence_update', async ({ sessionId, isOnline }) => {
    // Update in Firestore (for persistence)
    try {
      const sessionRef = admin.firestore().collection('liveSessions').doc(sessionId);
      await sessionRef.update({
        [`participantsStatus.${userId}.online`]: isOnline,
        [`participantsStatus.${userId}.lastActive`]: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Broadcast to others in the room
      socket.to(`session:${sessionId}`).emit(`session:${sessionId}:presence_change`, {
        userId,
        isOnline
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${userId}`);
    
    // Update presence for all sessions this socket was in
    for (const [sessionId, participants] of Object.entries(sessionParticipants)) {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        
        // Update Firestore
        try {
          const sessionRef = admin.firestore().collection('liveSessions').doc(sessionId);
          await sessionRef.update({
            [`participantsStatus.${userId}.online`]: false,
            [`participantsStatus.${userId}.lastActive`]: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating presence on disconnect:', error);
        }
      }
    }
  });
});

// Export the Express app as a Firebase function
export const webSocketServer = functions.https.onRequest(app);