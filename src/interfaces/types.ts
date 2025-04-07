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
    createdAt: any;
    uid?: string;
    sender: 'user' | 'bot';
    message: string;
    roomId: string;
    [key: string]: any;
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
    rating?: number; // Optional rating from 1-5
    date?: Timestamp; // When the testimonial was given
    userId?: string; // Optional reference to the user who gave the testimonial
}

export interface Review {
    id: string;
    userId: string;
    courseId: string;
    rating: number; // 1-5 stars
    title?: string;
    content: string; // Rich text content
    dateCreated: Timestamp;
    dateUpdated?: Timestamp;
    likes?: number;
    helpful?: number;
    approved?: boolean; // For moderation
    reported?: boolean; // For flagging inappropriate content
    userDisplayName?: string; // Display name of the reviewer
    userPhotoURL?: string; // Photo URL of the reviewer
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

// Schedule Data Interfaces
export interface Schedule {
    id: string;
    title: string;
    description?: string;
    startTime: Timestamp;
    endTime: Timestamp;
    courseId?: string;
    moduleId?: string;
    createdBy: string;
    attendees?: string[]; 
    type: 'lecture' | 'test' | 'assignment' | 'office-hours' | 'other';
    location?: string; // Could be physical location or virtual meeting link
    recurrence?: 'once' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
    reminderSent?: boolean;
    color?: string; // For calendar display
    isPublic?: boolean; // Whether this schedule is visible to all course participants
    metadata?: Record<string, any>; // For additional custom fields
}

export interface ScheduleResponse {
    id: string;
    details: Schedule;
}

// Notification Data Interfaces
export interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: 'course' | 'chat' | 'forum' | 'schedule' | 'announcement' | 'system';
    relatedId?: string;  // ID of related item (e.g., courseId, chatId)
    isRead: boolean;
    requiresAction: boolean;
    createdAt: Timestamp;
    image?: string;
    link?: string;
    data?: Record<string, any>;
}

export interface NotificationPreferences {
    userId: string;
    email: boolean;
    push: boolean;
    courseUpdates: boolean;
    newMessages: boolean;
    forumReplies: boolean;
    reminders: boolean;
    announcements: boolean;
    marketing: boolean;
    token?: string; // FCM token for push notifications
}

// Live Session Data Interfaces
export interface LiveSessionPollOption {
    id: string;
    text: string;
    votes: number;
}

export interface LiveSessionPoll {
    id: string;
    question: string;
    options: LiveSessionPollOption[];
    isOpen: boolean;
    createdAt: Timestamp;
}

export interface LiveSessionParticipant {
    userId: string;
    displayName: string; // Denormalized for easier display
    joinedAt: Timestamp;
}

export interface SessionRecording {
    url: string;
    createdAt: Timestamp;
    title: string;
}

export interface LiveSession {
    id: string;
    title: string;
    description?: string;
    courseId: string;
    hostId: string; // User ID of the teacher/mentor hosting
    status: 'scheduled' | 'live' | 'ended';
    scheduledStartTime: Timestamp;
    actualStartTime?: Timestamp;
    endTime?: Timestamp;
    meetingLink?: string; // Link to external meeting service if used
    participants?: LiveSessionParticipant[]; // Array of participants
    activePollId?: string | null; // ID of the currently active poll
    recordings?: SessionRecording[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CourseSubscription {
    userId: string;
    courseId: string;
    calendarSync: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    createdAt: Timestamp;
}

export interface SessionFeedback {
    id?: string;
    sessionId: string;
    courseId: string;
    userId: string;
    displayName: string;
    rating: number | null;
    comment: string;
    shareWithInstructor: boolean;
    createdAt: Timestamp;
}