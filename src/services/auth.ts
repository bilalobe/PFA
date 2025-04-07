import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  User} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { httpsCallable } from 'firebase/functions';
import { functions } from "../firebaseConfig";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

/**
 * Retries a function with exponential backoff
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for certain error types
      if (
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-email'
      ) {
        throw error;
      }
      
      // Only retry network-related errors
      if (
        error.code === 'auth/network-request-failed' || 
        error.code === 'auth/timeout' ||
        error.message?.includes('network')
      ) {
        console.warn(`Auth retry attempt ${attempt + 1}/${maxRetries + 1}`);
        // Wait with exponential backoff
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)));
          continue;
        }
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error('Max retries reached without success or failure');
}

/**
 * Signs in a user with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  return withRetry(async () => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Store the user credential for offline access
    await storeAuthData(userCredential.user);
    
    // Update user's last login time
    await updateUserLastLogin(userCredential.user.uid);
    
    return userCredential.user;
  });
}

/**
 * Signs in with a social provider
 */
export async function signInWithSocial(providerType: 'google' | 'github'): Promise<User> {
  let provider;
  
  if (providerType === 'google') {
    provider = new GoogleAuthProvider();
    // Add scopes if needed
    provider.addScope('email');
    provider.addScope('profile');
  } else if (providerType === 'github') {
    provider = new GithubAuthProvider();
    provider.addScope('user:email');
  } else {
    throw new Error(`Invalid provider type: ${providerType}`);
  }
  
  return withRetry(async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Store the user credential for offline access
      await storeAuthData(result.user);
      
      // Store user data in Firestore with offline persistence
      await updateUserProfile(result.user, {
        providerId: provider.providerId,
        lastLogin: serverTimestamp(),
      });
      
      return result.user;
    } catch (error: any) {
      // Handle specific social login errors
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email address but different sign-in credentials.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login canceled. The popup was closed before completion.');
      } else if (error.code) {
        // Wrap Firebase errors with more user-friendly messages
        throw new Error(`Authentication error: ${error.message || 'Unknown error'}`);
      } else {
        // Generic error handling
        console.error('Social login error:', error);
        throw new Error('Failed to sign in. Please try again later.');
      }
    }
  });
}

/**
 * Signs up a new user
 */
export async function signUpWithEmail(
  email: string, 
  password: string, 
  displayName: string,
  userType = 'student'
): Promise<User> {
  return withRetry(async () => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store the user credential for offline access
    await storeAuthData(user);
    
    // Create initial user profile
    await updateUserProfile(user, {
      displayName,
      userType,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    
    return user;
  });
}

/**
 * Signs out the current user with offline handling
 */
export async function signOutUser(): Promise<void> {
  try {
    // Update the UI immediately for better UX
    const user = auth.currentUser;
    if (user) {
      // Mark in local storage that logout was requested
      localStorage.setItem('logout-pending', user.uid);
    }
    
    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_last_sync');
    localStorage.removeItem('token_refresh_time');
    localStorage.removeItem('token_expiry'); // Added missing expiry clear
    
    await signOut(auth);
    localStorage.removeItem('logout-pending');
  } catch (error) {
    console.error('Error signing out:', error);
    // Keep the pending logout flag so we can retry later
    throw error;
  }
}

/**
 * Sends a password reset email with retry
 */
export async function resetPassword(email: string): Promise<void> {
  return withRetry(async () => {
    await sendPasswordResetEmail(auth, email);
  });
}

/**
 * Changes password for current user with retry
 */
export async function changePassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in.');
  
  return withRetry(async () => {
    await updatePassword(user, newPassword);
  });
}

/**
 * Gets the current user info with extra profile data
 */
export async function getCurrentUserProfile(): Promise<any | null> {
  const user = auth.currentUser;
  
  if (!user) {
    // Check for cached user data for offline support
    const cachedUser = localStorage.getItem('auth_user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        console.error('Failed to parse cached user data:', e);
      }
    }
    return null;
  }
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    let userData: any = { 
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };
    
    if (userSnap.exists()) {
      // Get Firestore data including userType
      const firestoreData = userSnap.data();
      userData = { ...userData, ...firestoreData };
    }
    
    // Cache the user data for offline access
    localStorage.setItem('auth_user', JSON.stringify({
      uid: userData.uid,
      displayName: userData.displayName,
      email: userData.email,
      photoURL: userData.photoURL,
      userType: userData.userType || 'student',
      lastAccess: Date.now()
    }));
    
    return userData;
  } catch (error) {
    console.error('Error getting user profile:', error);
    
    // Fall back to basic user info if Firestore is unavailable
    const cachedUser = localStorage.getItem('auth_user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        // Ignore parse errors, fall back to basic user object
      }
    }
    
    // Return basic user without userType to avoid the error
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      userType: 'student' // Default role when Firestore data is unavailable
    };
  }
}

/**
 * Listen for auth state changes with connection state awareness
 */
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  // Handle token refresh
  setupTokenRefresh();
  
  // Check for pending logout when online again
  window.addEventListener('online', async () => {
    const pendingLogout = localStorage.getItem('logout-pending');
    if (pendingLogout) {
      try {
        // Ensure the pending logout matches the current user if one exists
        if (!auth.currentUser || auth.currentUser.uid === pendingLogout) {
            await signOut(auth);
            localStorage.removeItem('logout-pending');
        } else {
            // Mismatch, clear the flag as it's for a different user session
            localStorage.removeItem('logout-pending');
        }
      } catch (error) {
        console.error('Error completing pending logout:', error);
      }
    }
    
    // Also refresh token if needed and sync offline updates
    const user = auth.currentUser;
    if (user) {
      await refreshIdToken(user);
      await syncOfflineProfileUpdates(user.uid); // Sync profile updates on reconnect
    }
  });
  
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Get fresh token when user state changes
        await refreshIdToken(user);
        // Sync offline updates when auth state changes (e.g., initial load)
        await syncOfflineProfileUpdates(user.uid);
      } catch (error) {
        console.error('Error refreshing token on auth state change:', error);
      }
    }
    callback(user);
  });
}

/**
 * Updates the user profile in Firestore
 */
export async function updateUserProfile(user: User, data: any) {
  const userRef = doc(db, 'users', user.uid);
  
  // Ensure essential fields are always present if updating
  const updateData = {
    uid: user.uid,
    email: user.email, // Keep email consistent
    ...data,
    updatedAt: serverTimestamp() // Add an update timestamp
  };
  
  try {
    // Use Firestore offline persistence if enabled
    await setDoc(userRef, updateData, { merge: true });
    
    // Update local cache immediately for better UX
    const cachedUser = localStorage.getItem('auth_user');
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        // Merge updateData, not just data, to ensure consistency
        localStorage.setItem('auth_user', JSON.stringify({
          ...parsedUser,
          ...updateData, 
          lastAccess: Date.now(),
          cacheVersion: 1 // Add version number for schema management
        }));
      } catch (e) {
        console.error('Failed to update cached user data:', e);
      }
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Store failed updates for syncing later when back online
    if (!navigator.onLine) {
      const pendingUpdatesKey = `user-updates-${user.uid}`;
      const pendingUpdates = JSON.parse(localStorage.getItem(pendingUpdatesKey) || '[]');
      // Store the specific update attempt, not just the data
      pendingUpdates.push({
        data: updateData, // Store the full update data
        timestamp: Date.now()
      });
      localStorage.setItem(pendingUpdatesKey, JSON.stringify(pendingUpdates));
      console.log('Profile update queued for offline sync.');
    } else {
      // Rethrow if online and still failed
      throw error;
    }
  }
}

/**
 * Updates the user's last login timestamp
 */
async function updateUserLastLogin(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { 
      lastLogin: serverTimestamp() 
    }, { merge: true });
  } catch (error) {
    console.error('Failed to update last login:', error);
    // Non-critical operation, so just log the error
  }
}

/**
 * Store auth data for offline access
 */
async function storeAuthData(user: User) {
  try {
    const token = await user.getIdToken();
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token_refresh_time', Date.now().toString());
    
    // Get and store token expiration time
    const tokenResult = await user.getIdTokenResult();
    localStorage.setItem('token_expiry', new Date(tokenResult.expirationTime).getTime().toString());
    
    const minimumUserData = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };
    
    localStorage.setItem('auth_user', JSON.stringify(minimumUserData));
    localStorage.setItem('auth_last_sync', Date.now().toString());
  } catch (error) {
    console.error('Failed to store auth data:', error);
  }
}

/**
 * Set up periodic token refresh
 */
function setupTokenRefresh() {
  // Clear any existing intervals
  if ((window as any).tokenRefreshInterval) {
    clearInterval((window as any).tokenRefreshInterval);
  }
  
  // Set new interval
  (window as any).tokenRefreshInterval = setInterval(async () => {
    const user = auth.currentUser;
    if (user) {
      await refreshIdToken(user);
    }
  }, TOKEN_REFRESH_INTERVAL);
}

/**
 * Refresh ID token and update storage
 */
export async function refreshIdToken(user: User): Promise<string | null> {
  // Add check for online status
  if (!navigator.onLine) {
      console.warn('Offline: Skipping token refresh.');
      return localStorage.getItem('auth_token'); // Return cached token if offline
  }

  try {
    // Get token expiry time from storage
    const expiryTime = localStorage.getItem('token_expiry');
    const now = Date.now();
    
    // Only refresh if needed (token expiring soon or no expiry info)
    if (!expiryTime || (parseInt(expiryTime) - now) < TOKEN_EXPIRY_BUFFER) {
      console.log('Refreshing auth token...'); // Add logging
      const token = await user.getIdToken(true); // Force refresh
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token_refresh_time', now.toString());
      
      // Update expiry time
      const tokenResult = await user.getIdTokenResult();
      localStorage.setItem('token_expiry', new Date(tokenResult.expirationTime).getTime().toString());
      
      return token;
    }
    
    // Return existing token if not expired
    return localStorage.getItem('auth_token');
  } catch (error: any) {
    console.error('Failed to refresh token:', error);
    // Handle specific errors like expired/invalid tokens
    if (error.code === 'auth/user-token-expired' || error.code === 'auth/invalid-user-token') {
        console.warn('User token expired or invalid. Forcing logout.');
        await signOutUser(); // Force logout if token is invalid
    }
    return null;
  }
}

/**
 * Get auth token with expiry checking
 */
export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    return await refreshIdToken(user);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Get user claims from token
 */
export async function getUserClaims(): Promise<Record<string, any> | null> {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims;
  } catch (error) {
    console.error('Error getting user claims:', error);
    return null;
  }
}

/**
 * Update user role (admin function)
 */
export async function updateUserRole(userId: string, role: string): Promise<boolean> {
  try {
    const setUserRole = httpsCallable<{userId: string, role: string}, {success: boolean}>(
      functions, 
      'setUserRole'
    );
    
    const result = await setUserRole({ userId, role });
    return result.data.success;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Sync offline profile updates when back online
 */
export async function syncOfflineProfileUpdates(userId: string): Promise<boolean> {
  if (!navigator.onLine) {
    return false;
  }
  
  const pendingUpdatesKey = `user-updates-${userId}`;
  const pendingUpdates = JSON.parse(localStorage.getItem(pendingUpdatesKey) || '[]');
  
  if (pendingUpdates.length === 0) {
    return true;
  }
  
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      // Can't sync updates for a different user
      return false;
    }
    
    const userRef = doc(db, 'users', userId);
    
    // Merge all pending updates into one
    const mergedData = pendingUpdates.reduce((acc: any, update: any) => {
      return { ...acc, ...update.data };
    }, {});
    
    await setDoc(userRef, mergedData, { merge: true });
    
    // Clear pending updates
    localStorage.removeItem(pendingUpdatesKey);
    return true;
  } catch (error) {
    console.error('Failed to sync offline profile updates:', error);
    return false;
  }
}