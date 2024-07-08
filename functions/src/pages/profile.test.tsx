import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Profile from './profile';
import { useAuth } from '../hooks/useAuth';
import { useFirestoreDocument } from '../hooks/useFirestore';
import { getAuth, signOut } from 'firebase/auth';

// Mock dependencies
jest.mock('../hooks/useAuth');
jest.mock('../hooks/useFirestore');
jest.mock('firebase/auth');
jest.mock('react-firebaseui/StyledFirebaseAuth');

describe('Profile Component', () => {
  const mockUser = { uid: '123', displayName: 'Test User' };
  const mockProfile = { name: 'Test User', email: 'test@example.com' };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useFirestoreDocument as jest.Mock).mockReturnValue({ docData: mockProfile, loading: false, error: null });
    (getAuth as jest.Mock).mockReturnValue({ currentUser: mockUser });
    (signOut as jest.Mock).mockResolvedValue(undefined);
  });

  test('renders loading state', () => {
    (useFirestoreDocument as jest.Mock).mockReturnValueOnce({ docData: null, loading: true, error: null });
    render(<Profile />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error state', () => {
    (useFirestoreDocument as jest.Mock).mockReturnValueOnce({ docData: null, loading: false, error: 'Error fetching data' });
    render(<Profile />);
    expect(screen.getByText(/Error: Error fetching data/i)).toBeInTheDocument();
  });

  test('renders login state when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValueOnce({ user: null });
    render(<Profile />);
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
  });

  test('renders profile view when user is authenticated', () => {
    render(<Profile />);
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
  });

  test('switches to edit mode correctly', () => {
    render(<Profile />);
    fireEvent.click(screen.getByText(/Edit/i));
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });

  test('handles save action correctly', async () => {
    render(<Profile />);
    fireEvent.click(screen.getByText(/Edit/i));
    fireEvent.click(screen.getByText(/Save/i));
    await waitFor(() => expect(screen.getByText(/Edit/i)).toBeInTheDocument());
  });

  test('handles cancel action correctly', () => {
    render(<Profile />);
    fireEvent.click(screen.getByText(/Edit/i));
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
  });

  test('handles logout correctly', async () => {
    render(<Profile />);
    fireEvent.click(screen.getByText(/Logout/i));
    await waitFor(() => expect(signOut).toHaveBeenCalled());
  });
});