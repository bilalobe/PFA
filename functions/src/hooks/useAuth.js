import { useState, useEffect } from 'react';
import { 
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth'; 
import { auth, db } from '../firebase'; // Firebase configuration 

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get and set the user's profile data from Firestore
  const getUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() };
        setUser(userData);
      } else {
        // Handle case where user doc does not exist (new user)
        // You might create a default user document in Firestore here
        // or redirect them to a profile completion page. 
        console.log("No user document found. Creating one...");
        const defaultUserData = { 
          // Your default user data here
        };
        await setDoc(doc(db, 'users', userId), defaultUserData); 
        setUser(defaultUserData); 
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Set up observer to monitor authentication state changes 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in 
        getUserProfile(user.uid); // Get the user's profile from Firestore
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []);

  // Functions for login and registration 
  const login = async (email, password) => {
    setLoading(true); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); 
      setUser({ id: userCredential.user.uid, ...userCredential.user });
    } catch (error) {
      console.error('Error during login:', error); 
      // ... handle errors, potentially display an error message to the user ...
    } finally {
      setLoading(false); 
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser({ id: userCredential.user.uid, ...userCredential.user }); 
    } catch (error) {
      console.error('Error during registration:', error); 
      // ... handle errors (e.g., user already exists, invalid password),
      //  display an error message to the user 
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth); 
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error); 
    }
  };

  return { user, loading, login, register, logout };
}