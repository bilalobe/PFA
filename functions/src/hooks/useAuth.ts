import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../interfaces/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // 1. User is signed in, get the user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            setUser({ ...docSnap.data() as User, id: firebaseUser.uid });
          } else {
            console.log("No such document!");
            // Optionally create a new user document
            setDoc(userDocRef, { email: firebaseUser.email }).then(() => {
              setUser({ 
                id: firebaseUser.uid, 
                email: firebaseUser.email ?? '',
                name: '',
                role: '',
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                emailVerified: firebaseUser.emailVerified,
                user_type: ''
              });
            });
          }
        }).catch((error) => {
          console.error("Error fetching user data:", error);
        }).finally(() => {
          setLoading(false);
        });
      } else {
        // 2. User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUser({ ...docSnap.data() as User });
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, { email: userCredential.user.email });
      setUser({ 
        id: userCredential.user.uid, 
        email: userCredential.user.email ?? '',
        name: '',
        role: '',
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName || '',
        photoURL: userCredential.user.photoURL || '',
        emailVerified: userCredential.user.emailVerified,
        user_type: ''
      });
    } catch (error) {
      console.error('Error during registration:', error);
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