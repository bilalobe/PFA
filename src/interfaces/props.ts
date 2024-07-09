import { SxProps, Theme } from '@mui/material/styles';
import { User, ChatMessage, Course } from './types';

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
  course: {
    courseTitle: string;
    courseDescription: string;
    courseImage?: string;
  };
  variant?: 'outlined' | 'elevation';
  sx?: object;
}



export interface CourseListProps {
  courses: Course[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  lastVisible: any;
  currentPage: number;
  coursesPerPage: number;
  onSearch: (query: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}