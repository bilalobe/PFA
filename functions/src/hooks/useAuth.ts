import { useState, useEffect } from 'react';
import { 
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth'; 
import { auth, db } from '../firebaseConfig.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
}

interface AuthContext {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthContext {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
        setUser(userData);
      } else {
        console.log("No user document found. Creating one...");
        const defaultUserData: UserProfile = { 
          id: userId,
        };
        await setDoc(doc(db, 'users', userId), defaultUserData); 
        setUser(defaultUserData); 
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        getUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); 
      setUser({ id: userCredential.user.uid, ...userCredential.user } as UserProfile);
    } catch (error) {
      console.error('Error during login:', error); 
    } finally {
      setLoading(false); 
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser({ id: userCredential.user.uid, ...userCredential.user } as UserProfile);
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          console.error('The email address is already in use by another account.');
          break;
        case 'auth/invalid-email':
          console.error('The email address is not valid.');
          break;
        case 'auth/operation-not-allowed':
          console.error('Email/password accounts are not enabled.');
          break;
        case 'auth/weak-password':
          console.error('The password is too weak.');
          break;
        default:
          console.error('Error during registration:', error.message);
      }
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