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

export interface UserForumPoints {
    id: string;
    points: number;
    user: User;
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
export interface Quiz {
    id: string;
    title: string;
    description: string;
    questions?: QuizQuestion[];
    [key: string]: any;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: AnswerData[];
    correctAnswer: string;
    [key: string]: any;
}

export interface QuizAttempt {
    id: string;
    quiz: string;
    user: string;
    score: number;
    startedAt: Timestamp;
    completedAt: Timestamp;
    [key: string]: any;
}

export interface QuizAnswerChoice {
    id: string;
    text: string;
    [key: string]: any;
}

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

// Forum Data Interfaces
export interface Forum {
    id: string;
    title: string;
    description: string;
    [key: string]: any;
}

export interface ForumPost {
    id: string;
    title: string;
    content: string;
    createdAt: Timestamp;
    createdBy: string;
    [key: string]: any;
}

// Comment Data Interface
export interface Comment {
    id: string;
    content: string;
    createdAt: Timestamp;
    createdBy: string;
    [key: string]: any;
}

// Enrollment Data Interface
export interface Enrollment {
    id: string;
    course: string;
    student: string;
    enrolledAt: Timestamp;
    completedModules: string[];
    [key: string]: any;
}

export interface EnrollmentData {
    [key: string]: any;
}

// Thread Data Interface
export interface Thread {
    id: string;
    title: string;
    content: string;
    createdAt: Timestamp;
    createdBy: string;
    [key: string]: any;
}

// Reply Data Interface
export interface Reply {
    id: string;
    content: string;
    createdAt: Timestamp;
    createdBy: string;
    [key: string]: any;
}

// Module Data Interface
export interface Module {
    id: string;
    title: string;
    description: string;
    resources: Resource[];
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

export interface ModerationReport {
    id: string;
    post: string;
    reason: string;
    reportedBy: string;
    actionTaken?: string;
    moderator?: string;
    [key: string]: any;
}