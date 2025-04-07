import { auth } from '../firebaseConfig';

// Time in milliseconds (30 minutes)
const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000;

/**
 * Starts monitoring the authentication state for token refreshes
 * and potential issues
 */
export function startAuthMonitor() {
  // Set up periodic token refresh
  const tokenRefreshInterval = setInterval(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        // Force token refresh
        await currentUser.getIdToken(true);
        console.log('Auth token refreshed successfully');
      } catch (error) {
        console.error('Error refreshing auth token:', error);
      }
    }
  }, TOKEN_REFRESH_INTERVAL);

  // Listen for token changes
  const unsubscribe = auth.onIdTokenChanged((user) => {
    if (user) {
      // User is signed in
      user.getIdTokenResult().then((idTokenResult) => {
        // Check token expiration
        const expirationTime = new Date(idTokenResult.expirationTime).getTime();
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        
        console.log(`Token valid for ${Math.round(timeUntilExpiration / 60000)} minutes`);
        
        // If token is close to expiration (less than 5 minutes), refresh it
        if (timeUntilExpiration < 5 * 60 * 1000) {
          user.getIdToken(true).catch(console.error);
        }
      }).catch(console.error);
    }
  });

  // Clean up function
  return () => {
    clearInterval(tokenRefreshInterval);
    unsubscribe();
  };
}