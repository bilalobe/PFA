import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dashboard from './dashboard';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Dashboard Component', () => {
  const mockPush = jest.fn();
  const mockUser = {
    uid: '123',
    email: 'testuser@example.com',
    role: 'teacher',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'teacher' }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading indicator initially', () => {
    render(<Dashboard />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('redirects to login if user is not authenticated', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn();
    });

    render(<Dashboard />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
  });

  test('fetches and sets user data correctly', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(getDoc).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/Dashboard/i)).toBeInTheDocument());
  });

  test('redirects unauthorized users to homepage', async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'student' }),
    });

    render(<Dashboard />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
  });

  test('toggles drawer open and close', async () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByLabelText(/open drawer/i));
    expect(screen.getByText(/Home/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/close drawer/i));
    expect(screen.queryByText(/Home/i)).not.toBeInTheDocument();
  });

  test('navigates correctly using navigation links', async () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByLabelText(/open drawer/i));
    fireEvent.click(screen.getByText(/Courses/i));
    expect(mockPush).toHaveBeenCalledWith('/courses');
  });

  test('toggles chatbot visibility', async () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByLabelText(/open drawer/i));
    fireEvent.click(screen.getByText(/Chatbot/i));
    expect(screen.getByText(/Chatbot Component/i)).toBeInTheDocument();
  });
});