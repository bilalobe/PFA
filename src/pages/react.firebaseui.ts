declare module 'react-firebaseui' {
    import { Auth } from 'firebase/auth';
    import * as React from 'react';
  
    interface FirebaseUIAuthConfig {
      // Define the properties of the uiConfig object
      // Example:
      signInFlow?: 'popup' | 'redirect';
      signInSuccessUrl?: string;
      signInOptions?: string[];
      // ... other properties
    }
  
    interface StyledFirebaseAuthProps {
      uiConfig: FirebaseUIAuthConfig;
      firebaseAuth: Auth;
    }
  
    export class StyledFirebaseAuth extends React.Component<StyledFirebaseAuthProps> {}
  }
  