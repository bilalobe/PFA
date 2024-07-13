// Register.tsx
import React, { useEffect } from 'react';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { auth, uiConfig } from '../../firebaseConfig';
import firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css'; // Import default CSS

const Register = () => {
  useEffect(() => {
    // Cleanup FirebaseUI widget on component unmount
    return () => {
      const ui = firebaseui.auth.AuthUI.getInstance();
      if (ui) {
        ui.delete();
      }
    };
  }, []);

  return (
    <div>
      <h1>Register</h1>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
    </div>
  );
};

export default Register;