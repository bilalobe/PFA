// register.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Register from './Register';
import { auth } from '../firebaseConfig';
import firebaseui from 'firebaseui';

// Mock FirebaseUI
jest.mock('firebaseui', () => {
  return {
    auth: {
      AuthUI: jest.fn().mockImplementation(() => {
        return {
          start: jest.fn(),
          delete: jest.fn(),
        };
      }),
    },
  };
});

jest.mock('../firebaseConfig', () => {
  return {
    auth: {
      onAuthStateChanged: jest.fn(),
    },
  };
});

describe('Register Component', () => {
  it('renders without crashing', () => {
    render(<Register />);
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('initializes FirebaseUI', () => {
    render(<Register />);
    expect(firebaseui.auth.AuthUI).toHaveBeenCalled();
  });
});