import React, { ServerContextJSONValue } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import HomeGuard from './Homeguard';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import { User } from '../interfaces/types';

jest.mock('../hooks/useAuth');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../components/AI/ChatbotContainer', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);
jest.mock('../pages/dashboard/dashboard', () => () => <div>Dashboard</div>);

describe('HomeGuard Component', () => {
  const mockLogout = jest.fn();
  const mockPush = jest.fn();

  const mockUser: User = {
    id: '123',
    uid: '123',
    displayName: 'Test User',
    name: 'Test User',
    role: 'user',
    email: 'testuser@example.com',
    photoURL: '', // Add the missing properties here
    emailVerified: false,
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ logout: mockLogout });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  test('opens and closes drawer', () => {
    render(<HomeGuard isAuthenticated={true} user={mockUser} onLogout={function (): void {
        throw new Error('Function not implemented.');
    } } />);
    
    // Open drawer
    fireEvent.click(screen.getByLabelText(/open drawer/i));
    expect(screen.getByText(/Home/i)).toBeInTheDocument();

    // Close drawer
    fireEvent.click(screen.getByLabelText(/close drawer/i));
    expect(screen.queryByText(/Home/i)).not.toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<HomeGuard isAuthenticated={true} user={mockUser} onLogout={function (): void {
        throw new Error('Function not implemented.');
    } } />);
    
    fireEvent.click(screen.getByLabelText(/open drawer/i));
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Courses/i)).toBeInTheDocument();
    expect(screen.getByText(/Forum/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.getByText(/Chatbot/i)).toBeInTheDocument();
  });

  test('handles logout correctly', async () => {
    render(<HomeGuard isAuthenticated={true} user={mockUser} onLogout={function (): void {
        throw new Error('Function not implemented.');
    } } />);
    
    fireEvent.click(screen.getByLabelText(/open drawer/i));
    fireEvent.click(screen.getByText(/Logout/i));
    
    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
  });

  test('toggles chatbot visibility', () => {
    const mockToggleChatbotVisibility = jest.fn(); // Declare and provide a mock implementation for mockToggleChatbotVisibility
  
    jest.spyOn(React, 'useContext').mockReturnValue({ toggleChatbotVisibility: mockToggleChatbotVisibility } as unknown as ServerContextJSONValue);
  
    render(<HomeGuard isAuthenticated={true} user={mockUser} onLogout={function (): void {
        throw new Error('Function not implemented.');
    } } />);
    
    fireEvent.click(screen.getByLabelText(/open drawer/i));
    fireEvent.click(screen.getByText(/Chatbot/i));
    
    expect(mockToggleChatbotVisibility).toHaveBeenCalled();
  });

  test('renders dashboard when authenticated', () => {
    render(<HomeGuard isAuthenticated={true} user={mockUser} onLogout={function (): void {
        throw new Error('Function not implemented.');
    } } />);
    
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});