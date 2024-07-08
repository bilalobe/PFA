import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Chatbot from './Chatbot';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { addDoc } from 'firebase/firestore';
import { aiApi } from '../../utils/api';
import { User } from '../../interfaces/types';

// Mock dependencies
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useFirestore');
jest.mock('firebase/firestore');
jest.mock('../../utils/api');

describe('Chatbot Component', () => {
    const mockUser: User = {
        id: '123',
        name: 'Test User',
        role: 'student',
        email: 'johndoe@example.com',
        uid: '123',
        displayName: 'John Doe',
        photoURL: 'https://example.com/johndoe.jpg',
        emailVerified: true,
      };  const mockMessages = [
    { sender: '123', message: 'Hello', timestamp: { seconds: 1620000000 } },
    { sender: 'chatbot', message: 'Hi there!', timestamp: { seconds: 1620000001 } }
  ];

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useFirestore as jest.Mock).mockReturnValue({ data: mockMessages, loading: false, error: null });
    (addDoc as jest.Mock).mockResolvedValue(undefined);
    (aiApi.getChatbotResponse as jest.Mock).mockResolvedValue('This is a response from the chatbot.');
  });

  test('renders loading state', () => {
    (useFirestore as jest.Mock).mockReturnValueOnce({ data: null, loading: true, error: null });
    render(<Chatbot chatRoomId={undefined} user={mockUser} conversation={[]} children={undefined} />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    (useFirestore as jest.Mock).mockReturnValueOnce({ data: null, loading: false, error: { message: 'Error fetching data' } });
    render(<Chatbot chatRoomId={undefined} user={mockUser} conversation={[]} children={undefined} />);
    expect(screen.getByText(/Error: Error fetching data/i)).toBeInTheDocument();
  });

  test('renders chat messages', () => {
    render(<Chatbot chatRoomId={undefined} user={mockUser} conversation={[]} children={undefined} />);
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
    expect(screen.getByText(/Hi there!/i)).toBeInTheDocument();
  });

  test('handles form submission with valid input', async () => {
    render(<Chatbot chatRoomId={undefined} user={mockUser} conversation={[]} children={undefined} />);
    fireEvent.change(screen.getByLabelText(/Type a message.../i), { target: { value: 'Test message' } });
    fireEvent.click(screen.getByText(/Send/i));
    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(2));
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
      sender: mockUser.id, // Changed uid to id
      message: 'Test message',
      timestamp: expect.anything()
    });
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
      sender: 'chatbot',
      message: 'This is a response from the chatbot.',
      timestamp: expect.anything()
    });
  });

  test('handles form submission with empty input', () => {
    render(<Chatbot chatRoomId={undefined} user={mockUser} conversation={[]} children={undefined} />);
    fireEvent.change(screen.getByLabelText(/Type a message.../i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/Send/i));
    expect(addDoc).not.toHaveBeenCalled();
  });

  test('handles form submission and chatbot response', async () => {
    render(<Chatbot chatRoomId={undefined} user={mockUser} conversation={[]} children={undefined} />);
    fireEvent.change(screen.getByLabelText(/Type a message.../i), { target: { value: 'Test message' } });
    fireEvent.click(screen.getByText(/Send/i));
    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(2));
    expect(screen.getByText(/Sending.../i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Send/i)).toBeInTheDocument());
  });
});