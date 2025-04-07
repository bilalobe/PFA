import { collection, doc, onSnapshot, query, updateDoc, where, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { io, Socket } from 'socket.io-client';
import { LiveSession, LiveSessionParticipant, LiveSessionPoll } from '../interfaces/types';

// Socket.IO connection for low-latency communication
let socket: Socket | null = null;

// Cache for active sessions (to avoid duplicate listeners)
const activeListeners: Record<string, () => void> = {};

/**
 * Initialize the Socket.IO connection for live interactions
 */
export const initLiveSessionSocket = (userId: string): Socket => {
  if (socket) {
    socket.close();
  }
  
  socket = io('/live-sessions', {
    auth: { userId },
    transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
  
  socket.on('connect', () => {
    console.log('Connected to live session socket');
  });
  
  socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
  });

  socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error);
  });
  
  return socket;
};

/**
 * Subscribe to a live session's real-time updates
 * Returns an unsubscribe function
 */
export const subscribeToLiveSession = (
  sessionId: string, 
  callback: (session: LiveSession) => void
): (() => void) => {
  // Check if we already have a listener for this session
  if (activeListeners[sessionId]) {
    return activeListeners[sessionId];
  }

  // Create Firestore listener
  const sessionRef = doc(db, 'liveSessions', sessionId);
  const unsubscribe = onSnapshot(
    sessionRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const sessionData = { id: snapshot.id, ...snapshot.data() } as LiveSession;
        callback(sessionData);
      }
    },
    (error) => {
      console.error(`Error subscribing to live session ${sessionId}:`, error);
    }
  );

  // Store unsubscribe function
  activeListeners[sessionId] = unsubscribe;

  // Join the Socket.IO room for this session if socket is connected
  if (socket && socket.connected) {
    socket.emit('join_session', { sessionId });
  }

  return () => {
    // Leave the Socket.IO room when unsubscribing
    if (socket && socket.connected) {
      socket.emit('leave_session', { sessionId });
    }
    
    // Remove from active listeners and unsubscribe
    delete activeListeners[sessionId];
    unsubscribe();
  };
};

/**
 * Subscribe to a live session's poll updates
 */
export const subscribeToPoll = (
  sessionId: string, 
  pollId: string, 
  callback: (poll: LiveSessionPoll) => void
): (() => void) => {
  const pollRef = doc(db, `liveSessions/${sessionId}/polls/${pollId}`);
  return onSnapshot(
    pollRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const pollData = { id: snapshot.id, ...snapshot.data() } as LiveSessionPoll;
        callback(pollData);
      }
    },
    (error) => {
      console.error(`Error subscribing to poll ${pollId}:`, error);
    }
  );
};

/**
 * Subscribe to the participant list for a session
 */
export const subscribeToParticipants = (
  sessionId: string, 
  callback: (participants: LiveSessionParticipant[]) => void
): (() => void) => {
  // Create Firestore listener that extracts just the participants array
  const sessionRef = doc(db, 'liveSessions', sessionId);
  return onSnapshot(
    sessionRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const sessionData = snapshot.data();
        const participants = sessionData.participants || [];
        callback(participants);
      }
    },
    (error) => {
      console.error(`Error subscribing to participants for session ${sessionId}:`, error);
    }
  );
};

/**
 * Update participant's "last active" timestamp and online status
 */
export const updateParticipantPresence = async (sessionId: string, userId: string, isOnline: boolean): Promise<void> => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    
    // Use a Socket.IO event for real-time presence updates
    if (socket && socket.connected) {
      socket.emit('presence_update', { sessionId, userId, isOnline });
    }
    
    // Also update in Firestore for persistence
    await updateDoc(sessionRef, {
      'participantsStatus': {
        [userId]: {
          online: isOnline,
          lastActive: serverTimestamp()
        }
      }
    });
  } catch (error) {
    console.error('Error updating presence:', error);
  }
};

/**
 * Listen for remote participant activity (typing, raising hand, etc.)
 */
export const subscribeToParticipantActions = (
  sessionId: string,
  onRaiseHand: (userId: string) => void,
  onLowerHand: (userId: string) => void,
  onTyping: (userId: string) => void
): (() => void) => {
  if (!socket) {
    return () => {}; // Return no-op if socket isn't connected
  }

  socket.on(`session:${sessionId}:raise_hand`, onRaiseHand);
  socket.on(`session:${sessionId}:lower_hand`, onLowerHand);
  socket.on(`session:${sessionId}:typing`, onTyping);

  // Return cleanup function
  return () => {
    socket?.off(`session:${sessionId}:raise_hand`, onRaiseHand);
    socket?.off(`session:${sessionId}:lower_hand`, onLowerHand);
    socket?.off(`session:${sessionId}:typing`, onTyping);
  };
};

/**
 * Signal that current user is raising/lowering hand
 */
export const signalHandRaise = (sessionId: string, userId: string, isRaised: boolean): void => {
  if (socket && socket.connected) {
    socket.emit(isRaised ? 'raise_hand' : 'lower_hand', { sessionId, userId });
  }
};

/**
 * Signal that current user is typing (for chat functionality)
 */
export const signalTyping = (sessionId: string, userId: string): void => {
  if (socket && socket.connected) {
    socket.emit('typing', { sessionId, userId });
  }
};

/**
 * Clean up all subscriptions
 */
export const cleanupLiveSessionSubscriptions = (): void => {
  // Unsubscribe from all active listeners
  Object.values(activeListeners).forEach(unsubscribe => unsubscribe());
  
  // Close socket connection
  if (socket) {
    socket.close();
    socket = null;
  }
};