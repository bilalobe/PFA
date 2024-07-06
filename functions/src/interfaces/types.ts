import { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';

// User Data Interface

export interface User {
    id: string;
    name: string;
    role: string;
    email: string;
    uid: string;
    displayName: string;
    photoURL: string;
    emailVerified: boolean;
    user_type?: string; // Add this line
    [key: string]: any;
}
  
export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    [key: string]: any;
}
  
// General Data Interfaces
export interface CourseData {
    [key: string]: any;
}

export interface ModuleData {
    [key: string]: any;
}

export interface QuizData {
    [key: string]: any;
}

export interface ForumData {
    [key: string]: any;
}

// Quiz Attempt Data Interface
export interface QuizAttemptData {
    user: string;
    score: number;
    startedAt: Timestamp;
    completedAt: Timestamp;
    [key: string]: any;
}

// Question and Answer Data Interfaces
export interface QuestionData {
    id: string;
    [key: string]: any;
}

export interface AnswerData {
    [key: string]: any;
}

export interface PostData {
    title: string;
    content: string;
    [key: string]: any; // Add other fields as necessary
  }
  
export interface CreatePostResponse {
    id: string;
    [key: string]: any;
  }
// Resource Data Interface
export interface Resource {
    id: string;
    title: string;
    url: string;
    type: string;
    [key: string]: any;
}

// Post Data Interfaces
export interface Post {
    id: string;
    [key: string]: any;
}

export interface FetchPostsResult {
    posts: Post[];
    lastVisible?: QueryDocumentSnapshot;
}

// Error Interface
export interface Error {
    code: string;
    message: string;
}