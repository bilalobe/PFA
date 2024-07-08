import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../interfaces/types';
import { useRouter } from 'next/router';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth(): AuthState & { login: (email: string, password: string) => Promise<void>; register: (email: string, password: string, userType?: string) => Promise<void>; logout: () => Promise<void> } {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        getDoc(userDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              setAuthState({
                user: { ...docSnap.data() as User, id: firebaseUser.uid },
                loading: false,
                error: null,
              });
            } else {
              console.log("No such document!");
              const defaultUserData = {
                email: firebaseUser.email,
                name: firebaseUser.displayName || '',
                role: 'student', // Set a default role
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                emailVerified: firebaseUser.emailVerified,
                user_type: 'student' //  (Or use 'learner' or a similar term)
              };
              setDoc(userDocRef, defaultUserData)
                .then(() => {
                  setAuthState({
                    user: { ...defaultUserData, id: firebaseUser.uid },
                    loading: false,
                    error: null,
                  });
                })
                .catch((error) => {
                  setAuthState({
                    user: null,
                    loading: false,
                    error: `Error fetching user data: ${error.message}`,
                  });
                });
            }
          })
          .catch((error) => {
            setAuthState({
              user: null,
              loading: false,
              error: `Error fetching user data: ${error.message}`,
            });
          });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      setAuthState({
        user: null,
        loading: false,
        error: `Error during login: ${error.message}`,
      });
    }
  };
  
  const register = async (email: string, password: string, userType = 'student') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
  
      await setDoc(userDocRef, {
        email: user.email,
        name: '', //  Or use user.displayName
        role: userType,
        uid: user.uid,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        user_type: userType
      });
  
      router.push('/profile');
  
    } catch (error: any) {
      setAuthState({
        user: null,
        loading: false,
        error: `Error during registration: ${error.message}`,
      });
    }
  };
  
  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error: any) {
      setAuthState({
        user: null,
        loading: false,
        error: `Error during logout: ${error.message}`,
      });
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
  };
}
