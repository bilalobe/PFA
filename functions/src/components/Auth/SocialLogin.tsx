import React, { useState } from 'react';
import { Button } from '@mui/material';
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { logEvent } from 'firebase/analytics';
import { doc, setDoc } from 'firebase/firestore';
import { auth, analytics, db } from '../../firebaseConfig';
import { FirebaseError } from 'firebase/app';

const SocialLogin = () => {
  const [isLoading, setIsLoading] = useState(false);


const handleSocialLogin = async (providerType: 'google' | 'github') => {
  let provider: GoogleAuthProvider | GithubAuthProvider | null = null;
  if (providerType === 'google') {
    provider = new GoogleAuthProvider();
  } else if (providerType === 'github') {
    provider = new GithubAuthProvider();
  } else {
    throw new Error(`Invalid provider type: ${providerType}`);
  }

  try {
    setIsLoading(true);
    const result = await signInWithPopup(auth, provider);
    console.log(result.user);

    // Log the login event to Firebase Analytics
    logEvent(analytics, 'login', { method: providerType });

    // Store user data in Firestore
    const userRef = doc(db, 'users', result.user.uid);
    await setDoc(userRef, {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      providerId: provider.providerId,
    }, { merge: true });

  } catch (error) {
    if (error instanceof FirebaseError) {
      // Handle Firebase errors specifically
      console.error(`Firebase error (${error.code}): ${error.message}`);
      // Customize error handling based on error codes
      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
          alert('An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.');
          break;
        case 'auth/popup-closed-by-user':
          alert('The popup has been closed by the user before finalizing the operation.');
          break;
        default:
          alert('An error occurred during the login process. Please try again.');
      }
    } else if (error instanceof Error) {
      // Handle other errors
      console.error(`Error: ${error.message}`);
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div>
      <Button
        onClick={() => handleSocialLogin('google')}
        variant="contained"
        color="primary"
        disabled={isLoading}
      >
        Login with Google
      </Button>
      <Button
        onClick={() => handleSocialLogin('github')}
        variant="contained"
        color="secondary"
        disabled={isLoading}
      >
        Login with GitHub
      </Button>
    </div>
  );
};

export default SocialLogin;