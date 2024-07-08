import { SxProps, Theme } from '@mui/material/styles';
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

export interface CustomCardProps {
  title: string;
  content: string;
  image?: string;
  variant?: 'outlined' | 'elevation';
  sx?: SxProps<Theme>;
}


export interface CourseCardProps {
  courseTitle: string;
  courseDescription: string;
  courseImage?: string;
  variant?: 'outlined' | 'elevation';
  sx?: SxProps<Theme>;
}
