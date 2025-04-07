import { useState, useEffect } from 'react';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { subscribeToAuthChanges, getCurrentUserProfile } from '../services/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNetworkStatus } from './useNetworkStatus';

interface AuthState {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  lastSyncTime: number | null;
}

export function useAuth() {
  const { isOnline } = useNetworkStatus();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null,
    isOnline,
    lastSyncTime: null
  });

  useEffect(() => {
    // Update online status when network changes
    setAuthState(prev => ({ ...prev, isOnline }));
    
    // If we're coming back online, attempt to sync cached changes
    if (isOnline && authState.user) {
      syncOfflineChanges(authState.user.uid);
    }
  }, [isOnline]);
  
  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      try {
        if (user) {
          const profile = await getCurrentUserProfile();
          
          // Get fresh tokens for API calls
          const token = await user.getIdToken();
          localStorage.setItem('auth_token', token);
          
          // Store last successful authentication time
          const timestamp = Date.now();
          localStorage.setItem('auth_last_sync', timestamp.toString());
          
          setAuthState({ 
            user, 
            userProfile: profile, 
            loading: false, 
            error: null, 
            isOnline, 
            lastSyncTime: timestamp 
          });
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_last_sync');
          
          setAuthState({ 
            user: null, 
            userProfile: null, 
            loading: false, 
            error: null, 
            isOnline, 
            lastSyncTime: null 
          });
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Authentication error' 
        }));
      }
    });
    
    // Check if we have a pending auth state from local storage
    const checkOfflineAuthState = () => {
      const cachedUser = localStorage.getItem('auth_user');
      const cachedToken = localStorage.getItem('auth_token');
      const lastSyncTime = localStorage.getItem('auth_last_sync');
      
      if (cachedUser && !auth.currentUser) {
        try {
          const userData = JSON.parse(cachedUser);
          
          // Set offline auth state if we're offline
          if (!isOnline) {
            setAuthState(prev => ({ 
              ...prev, 
              userProfile: userData, 
              loading: false,
              isOnline: false,
              lastSyncTime: lastSyncTime ? parseInt(lastSyncTime) : null
            }));
          }
        } catch (e) {
          // Invalid cached data
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_last_sync');
        }
      }
    };
    
    checkOfflineAuthState();
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Cache user data for offline access when user changes
  useEffect(() => {
    if (authState.userProfile) {
      // Store minimal user data for offline access
      const minimalUserData = {
        uid: authState.userProfile.uid,
        displayName: authState.userProfile.displayName,
        email: authState.userProfile.email,
        photoURL: authState.userProfile.photoURL,
        userType: authState.userProfile.userType || 'student',
        lastAccess: Date.now()
      };
      localStorage.setItem('auth_user', JSON.stringify(minimalUserData));
    }
  }, [authState.userProfile]);
  
  // Function to sync any offline changes once back online
  const syncOfflineChanges = async (userId: string) => {
    try {
      const offlineChanges = localStorage.getItem(`offline_changes_${userId}`);
      if (offlineChanges) {
        const changes = JSON.parse(offlineChanges);
        
        // Process each change - this is just a simplified example
        // You'd implement specific sync logic based on your app's needs
        for (const change of changes) {
          if (change.type === 'course_progress') {
            const userProgressRef = doc(db, 'enrollments', change.enrollmentId);
            await setDoc(userProgressRef, { progress: change.progress }, { merge: true });
          }
        }
        
        // Clear processed changes
        localStorage.removeItem(`offline_changes_${userId}`);
      }
    } catch (error) {
      console.error('Failed to sync offline changes:', error);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_last_sync');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      if (auth.currentUser) {
        const newToken = await auth.currentUser.getIdToken(true);
        localStorage.setItem('auth_token', newToken);
        return newToken;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  };
  
  // Add offline changes to queue for syncing later
  const addOfflineChange = (userId: string, change: any) => {
    try {
      const currentChanges = localStorage.getItem(`offline_changes_${userId}`) || '[]';
      const changes = JSON.parse(currentChanges);
      changes.push({
        ...change,
        timestamp: Date.now()
      });
      localStorage.setItem(`offline_changes_${userId}`, JSON.stringify(changes));
    } catch (error) {
      console.error('Failed to store offline change:', error);
    }
  };

  return {
    user: authState.user,
    userProfile: authState.userProfile,
    loading: authState.loading,
    error: authState.error,
    isOnline: authState.isOnline,
    isLoggedIn: !!authState.user,
    isOfflineAuthenticated: !authState.isOnline && !!authState.userProfile,
    lastSyncTime: authState.lastSyncTime,
    logout,
    refreshToken,
    addOfflineChange
  };
}
