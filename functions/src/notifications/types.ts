export type NotificationType =
  | "course_update"
  | "assignment"
  | "grade"
  | "forum"
  | "live_session"
  | "moderation"
  | "warning"
  | "achievement"
  | "system";

export interface BaseNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  readAt?: FirebaseFirestore.Timestamp;
}

export interface CourseNotification extends BaseNotification {
  type: "course_update";
  metadata: {
    courseId: string;
    updateType: "content" | "schedule" | "announcement";
    courseName: string;
  };
}

export interface AssignmentNotification extends BaseNotification {
  type: "assignment";
  metadata: {
    courseId: string;
    assignmentId: string;
    dueDate: FirebaseFirestore.Timestamp;
    courseName: string;
    assignmentName: string;
  };
}

export interface GradeNotification extends BaseNotification {
  type: "grade";
  metadata: {
    courseId: string;
    assignmentId: string;
    grade: number;
    courseName: string;
    assignmentName: string;
  };
}

export interface ForumNotification extends BaseNotification {
  type: "forum";
  metadata: {
    forumId: string;
    threadId?: string;
    postId?: string;
    action: "reply" | "mention" | "like";
    authorName: string;
  };
}

export interface LiveSessionNotification extends BaseNotification {
  type: "live_session";
  metadata: {
    sessionId: string;
    courseId: string;
    startTime: FirebaseFirestore.Timestamp;
    hostName: string;
    courseName: string;
  };
}

export interface ModerationNotification extends BaseNotification {
  type: "moderation";
  metadata: {
    contentId: string;
    contentType: string;
    reportCount: number;
    priority: "low" | "medium" | "high";
  };
}

export interface WarningNotification extends BaseNotification {
  type: "warning";
  metadata: {
    contentId: string;
    contentType: string;
    reason: string;
    severity: "low" | "medium" | "high";
  };
}

export interface AchievementNotification extends BaseNotification {
  type: "achievement";
  metadata: {
    achievementId: string;
    achievementName: string;
    type: "badge" | "certificate" | "level";
    points?: number;
  };
}

export interface SystemNotification extends BaseNotification {
  type: "system";
  metadata: {
    category: "maintenance" | "update" | "security" | "announcement";
    priority: "low" | "medium" | "high";
    action?: string;
  };
}

export type Notification =
  | CourseNotification
  | AssignmentNotification
  | GradeNotification
  | ForumNotification
  | LiveSessionNotification
  | ModerationNotification
  | WarningNotification
  | AchievementNotification
  | SystemNotification;