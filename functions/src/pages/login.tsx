import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { auth, uiConfig } from '../firebaseConfig';

const LoginPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div>
      <h1>Login with FirebaseUI</h1>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
    </div>
  );
};

export default LoginPage;