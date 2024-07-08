import { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';

// User Data Interfaces
interface BaseUser {
    id: string;
    name: string;
    email: string | null;
    displayName: string;
    photoURL: string;
    emailVerified: boolean;
}

export interface User extends BaseUser {
    role: string;
    uid: string;
    user_type?: string;
    [key: string]: any;
}
  
export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    [key: string]: any;
}

// Course Data Interfaces
export interface Course {
    id: string;
    title: string;
    description: string;
    modules: string[];
    [key: string]: any;
}

export interface CourseData {
    [key: string]: any;
}

export interface ModuleData {
    [key: string]: any;
}

// Quiz Data Interfaces
export interface QuizData {
    [key: string]: any;
}

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

// Forum Data Interfaces
export interface ForumData {
    [key: string]: any;
}

export interface PostData {
    title: string;
    content: string;
    [key: string]: any;
}

export interface CreatePostResponse {
    id: string;
    [key: string]: any;
}

export interface FetchPostsResult {
    posts: Post[];
    lastVisible?: QueryDocumentSnapshot;
}

// Resource Data Interface
export interface Resource {
    id: string;
    title: string;
    url: string;
    type: string;
    [key: string]: any;
}

// Post Data Interface
export interface Post {
    id: string;
    [key: string]: any;
}

// Chat Message Interface AI
export interface ChatMessage {
    uid?: string;
    sender: 'user' | 'bot';
    message: string;
}
// Error Interface
export interface Error {
    code: string;
    message: string;
}

export interface Testimonial {
    id: number;
    name: string;
    text: string;
    avatarUrl: string;
  }