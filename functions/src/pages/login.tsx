import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { uiConfig } from '../firebaseConfig';
import dynamic from 'next/dynamic';
import 'firebaseui/dist/firebaseui.css';

// Dynamically import StyledFirebaseAuth to disable SSR
const DynamicStyledFirebaseAuth = dynamic(
  () => import('react-firebaseui/StyledFirebaseAuth').then((mod) => mod.default),
  { ssr: false }
);

const auth = getAuth();

// Function to listen for authentication state changes
export function onAuthStateChanged(cb: (user: User | null) => void) {
  return auth.onAuthStateChanged(cb);
}

// Function to sign in with Google
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
}

// Function to sign out
export async function signOut() {
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}


const LoginPage: React.FC = () => {
  return (
    <div>
      <h1>Login with FirebaseUI</h1>
      {/* Render the dynamically imported component */}
      <DynamicStyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
    </div>
  );
};

export default LoginPage;
