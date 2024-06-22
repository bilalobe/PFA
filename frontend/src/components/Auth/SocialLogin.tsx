import React, { useState } from 'react';
import firebase from '../../../firebaseConfig'; // Adjust the import path
import { Button } from '@mui/material';

const SocialLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (providerType) => {
    let provider;
    if (providerType === 'google') {
      provider = new firebase.auth.GoogleAuthProvider();
    } else if (providerType === 'github') { // Add GitHub case
      provider = new firebase.auth.GithubAuthProvider();
    }

    try {
      setIsLoading(true);
      const result = await firebase.auth().signInWithPopup(provider);
      console.log(result.user);
    } catch (error) {
      console.error(error.message); // Consider showing this message to the user
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
      {/* Add a button for GitHub login */}
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