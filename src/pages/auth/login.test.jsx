import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { uiConfig } from '../../firebaseConfig'; // Import your uiConfig
import LoginPage, { onAuthStateChanged, signOut, signInWithGoogle } from './login';

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
      onAuthStateChanged: jest.fn(),
      signOut: jest.fn(() => Promise.resolve()), 
    })),
    GoogleAuthProvider: jest.fn(() => ({})), 
    signInWithPopup: jest.fn(() => Promise.resolve({ 
      user: { 
        uid: 'test-user-uid', // Example UID 
        displayName: 'Test User' 
      }
    })), 
}));

jest.mock('react-firebaseui/StyledFirebaseAuth', () => () => {
  return <div>Mocked StyledFirebaseAuth Component</div>;
});

describe('LoginPage', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('renders the FirebaseUI login component', async () => {
        render(<LoginPage />);
        // You may need to use more specific selectors based on how your StyledFirebaseAuth is configured.
        expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument(); 
    }); 

    describe('onAuthStateChanged', () => {
        it('calls the Firebase onAuthStateChanged method', () => {
            const mockCallback = jest.fn(); 
            onAuthStateChanged(mockCallback);

            const auth = getAuth(); 
            expect(auth.onAuthStateChanged).toHaveBeenCalledWith(mockCallback); 
        });
    });

    describe('signInWithGoogle', () => {
        it('signs in with Google using Firebase', async () => {
          await act(async () => { 
            await signInWithGoogle(); 
          });
          expect(GoogleAuthProvider).toHaveBeenCalledTimes(1); 
          expect(signInWithPopup).toHaveBeenCalledTimes(1); 
        });
    });

    describe('signOut', () => {
        it('signs the user out', async () => {
          const auth = getAuth(); 
          await act(async () => { 
            await signOut(); 
          });
          expect(auth.signOut).toHaveBeenCalledTimes(1); 
        });
    }); 
});