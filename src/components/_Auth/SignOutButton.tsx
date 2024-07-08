import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebaseConfig';

// Initialize Firebase
const FirebaseApp = initializeApp(firebaseConfig);

const SignOutButton = () => {
  const handleSignOut = async () => {
    const auth = getAuth(FirebaseApp);
    try {
      await signOut(auth);
      alert('You have been signed out.');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Sign out error:', error.message);
        alert('Failed to sign out. Please try again.');
      } else {
        console.error('Sign out error:', error);
        alert('Failed to sign out. Please try again.');
      }
    }
  };

  return (
    <button onClick={handleSignOut}>Sign Out</button>
  );
};

export default SignOutButton;