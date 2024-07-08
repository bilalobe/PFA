import { User, ChatMessage } from './types';

export interface ChatbotProps {
  chatRoomId: any;
  user: User;
  conversation: ChatMessage[];
  children: React.ReactNode;
}

export type HomeGuardProps = {
  isAuthenticated: boolean;
  user: User;
  onLogout: () => void;
};

export interface PrivateRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}