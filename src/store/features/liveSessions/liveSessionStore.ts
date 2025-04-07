// src/store/features/liveSessions/liveSessionStore.ts
import { create } from 'zustand';
import { LiveSession, LiveSessionPoll } from '../../../interfaces/types';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface LiveSessionState {
  activeSessionId: string | null;
  activePoll: LiveSessionPoll | null;
  availableSessions: LiveSession[];
  loading: boolean;
  error: string | null;
  isHandRaised: boolean;
  
  // Actions
  setActiveSession: (sessionId: string | null) => void;
  setAvailableSessions: (sessions: LiveSession[]) => void;
  setActivePoll: (poll: LiveSessionPoll | null) => void;
  toggleHandRaise: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const liveSessionStore = create<LiveSessionState>((set) => ({
  activeSessionId: null,
  activePoll: null,
  availableSessions: [],
  loading: false,
  error: null,
  isHandRaised: false,
  
  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
  setAvailableSessions: (sessions) => set({ availableSessions: sessions }),
  setActivePoll: (poll) => set({ activePoll: poll }),
  toggleHandRaise: () => set((state) => ({ isHandRaised: !state.isHandRaised })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// Selectors
export const selectSessionsForCourse = (courseId: string) => 
  liveSessionStore.getState().availableSessions.filter(session => session.courseId === courseId);
