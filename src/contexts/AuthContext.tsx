import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

// Define the shape of the context
interface AuthContextType {
  user: any;
  userProfile: any;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  isLoggedIn: boolean;
  isOfflineAuthenticated: boolean;
  lastSyncTime: number | null;
  logout: () => Promise<boolean>;
  refreshToken: () => Promise<string | null>;
  addOfflineChange: (userId: string, change: any) => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}