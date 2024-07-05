import { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';

// General Data Interfaces
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