import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

const SignOutButton = () => {
  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      alert('You have been signed out.');
    } catch (error) {
      console.error('Sign out error:', error.message);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <button onClick={handleSignOut}>Sign Out</button>
  );
};

export default SignOutButton;