import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LiveSession } from '../interfaces/types';

// Cache key constants
const CACHE_KEY_UPCOMING_SESSIONS = 'cached_upcoming_sessions';
const CACHE_KEY_TIMESTAMP = 'cached_sessions_timestamp';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHED_SESSIONS = 20; // Maximum number of sessions to cache

/**
 * Fetches upcoming live sessions for a course and caches them for offline access
 */
export const prefetchAndCacheUpcomingSessions = async (courseId?: string): Promise<LiveSession[]> => {
  try {
    // Create a query for upcoming sessions
    const now = new Date();
    const queryConstraints = [
      where('status', 'in', ['scheduled', 'live']),
      where('scheduledStartTime', '>=', Timestamp.fromDate(now)),
      orderBy('scheduledStartTime', 'asc'),
      limit(MAX_CACHED_SESSIONS)
    ];
    
    // Add courseId constraint if provided
    if (courseId) {
      queryConstraints.unshift(where('courseId', '==', courseId));
    }
    
    const sessionsQuery = query(collection(db, 'liveSessions'), ...queryConstraints);
    const snapshot = await getDocs(sessionsQuery);
    
    // Map documents to LiveSession objects
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LiveSession[];
    
    // Store in localStorage
    localStorage.setItem(CACHE_KEY_UPCOMING_SESSIONS, JSON.stringify(sessions));
    localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
    
    return sessions;
  } catch (error) {
    console.error('Error prefetching sessions:', error);
    return [];
  }
};

/**
 * Gets cached upcoming sessions, refreshing from server if online and cache is stale
 */
export const getCachedUpcomingSessions = async (courseId?: string, forceRefresh = false): Promise<LiveSession[]> => {
  // Check if we're online and should refresh the cache
  const isOnline = navigator.onLine;
  const cachedTimestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
  const isCacheStale = !cachedTimestamp || (Date.now() - parseInt(cachedTimestamp)) > CACHE_EXPIRY;
  
  if ((isOnline && (isCacheStale || forceRefresh))) {
    // Get fresh data from server
    return await prefetchAndCacheUpcomingSessions(courseId);
  } else {
    // Return cached data
    const cachedData = localStorage.getItem(CACHE_KEY_UPCOMING_SESSIONS);
    if (cachedData) {
      let sessions = JSON.parse(cachedData) as LiveSession[];
      
      // Filter by courseId if needed
      if (courseId) {
        sessions = sessions.filter(session => session.courseId === courseId);
      }
      
      return sessions;
    }
    
    // If we're online but cache is empty, fetch fresh data
    if (isOnline) {
      return await prefetchAndCacheUpcomingSessions(courseId);
    }
    
    return []; // No cached data and offline
  }
};

/**
 * Gets a specific session from cache if available
 */
export const getCachedSession = (sessionId: string): LiveSession | null => {
  const cachedData = localStorage.getItem(CACHE_KEY_UPCOMING_SESSIONS);
  if (!cachedData) return null;
  
  const sessions = JSON.parse(cachedData) as LiveSession[];
  return sessions.find(session => session.id === sessionId) || null;
};

/**
 * Clears cached sessions data
 */
export const clearSessionsCache = (): void => {
  localStorage.removeItem(CACHE_KEY_UPCOMING_SESSIONS);
  localStorage.removeItem(CACHE_KEY_TIMESTAMP);
};