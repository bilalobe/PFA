import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { RecommendationFeedback, RecommendationMetrics } from "./types";

const db = admin.firestore();

export const handleRecommendationFeedback = functions.firestore
  .document("recommendationFeedback/{feedbackId}")
  .onCreate(async (snapshot, context) => {
    try {
      const feedback = snapshot.data() as RecommendationFeedback;
      
      // Update recommendation quality metrics
      await updateRecommendationMetrics(feedback);
      
      // Update user interaction patterns
      await updateUserInteractionPatterns(feedback);
      
      // Trigger recommendation refresh if needed
      await checkAndTriggerRecommendationRefresh(feedback);
    } catch (error) {
      functions.logger.error("Error handling recommendation feedback:", error);
    }
  });

async function updateRecommendationMetrics(feedback: RecommendationFeedback) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.setDate(1));

  const periods: Array<{
    id: string;
    period: "daily" | "weekly" | "monthly";
    startDate: Date;
  }> = [
    { id: `daily_${startOfDay.toISOString().split("T")[0]}`, period: "daily", startDate: startOfDay },
    { id: `weekly_${startOfWeek.toISOString().split("T")[0]}`, period: "weekly", startDate: startOfWeek },
    { id: `monthly_${startOfMonth.toISOString().split("T")[0]}`, period: "monthly", startDate: startOfMonth },
  ];

  const batch = db.batch();

  for (const { id, period, startDate } of periods) {
    const metricsRef = db
      .collection("recommendationMetrics")
      .doc(feedback.userId)
      .collection(period)
      .doc(id);

    const metricsDoc = await metricsRef.get();
    
    if (!metricsDoc.exists) {
      batch.set(metricsRef, {
        userId: feedback.userId,
        period,
        startDate: admin.firestore.Timestamp.fromDate(startDate),
        endDate: admin.firestore.Timestamp.fromDate(
          new Date(startDate.getTime() + getPeriodDuration(period))
        ),
        metrics: initializeMetrics(),
      });
    }

    batch.update(metricsRef, {
      [`metrics.totalRecommendations`]: admin.firestore.FieldValue.increment(1),
      [`metrics.interactedRecommendations`]: admin.firestore.FieldValue.increment(
        isInteractionMetric(feedback.action) ? 1 : 0
      ),
      [`metrics.clickThroughRate`]: admin.firestore.FieldValue.increment(
        feedback.action === "click" ? 1 : 0
      ),
      [`metrics.averageRelevanceScore`]: admin.firestore.FieldValue.increment(
        feedback.feedback?.relevant ? 1 : 0
      ),
      [`metrics.conversionRate`]: admin.firestore.FieldValue.increment(
        feedback.action === "save" ? 1 : 0
      ),
    });
  }

  await batch.commit();
}

async function updateUserInteractionPatterns(feedback: RecommendationFeedback) {
  const userRef = db.collection("users").doc(feedback.userId);
  const user = await userRef.get();
  const userData = user.data();

  if (!userData) return;

  const interactionPatterns = userData.interactionPatterns || {
    preferredContentTypes: {},
    activeHours: {},
    weekdayActivity: {},
    contentTags: {},
  };

  // Update preferred content types
  const recommendation = await db
    .collection("recommendations")
    .doc(feedback.recommendationId)
    .get();
  const recData = recommendation.data();

  if (recData?.type) {
    interactionPatterns.preferredContentTypes[recData.type] =
      (interactionPatterns.preferredContentTypes[recData.type] || 0) + 1;
  }

  // Update active hours
  const hour = new Date(feedback.timestamp.toDate()).getHours();
  interactionPatterns.activeHours[hour] =
    (interactionPatterns.activeHours[hour] || 0) + 1;

  // Update weekday activity
  const weekday = new Date(feedback.timestamp.toDate()).getDay();
  interactionPatterns.weekdayActivity[weekday] =
    (interactionPatterns.weekdayActivity[weekday] || 0) + 1;

  // Update content tags
  if (recData?.tags) {
    for (const tag of recData.tags) {
      interactionPatterns.contentTags[tag] =
        (interactionPatterns.contentTags[tag] || 0) + 1;
    }
  }

  await userRef.update({
    interactionPatterns,
    lastInteractionAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function checkAndTriggerRecommendationRefresh(
  feedback: RecommendationFeedback
) {
  const threshold = 10; // Number of interactions before triggering refresh
  const timeWindow = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const recentFeedback = await db
    .collection("recommendationFeedback")
    .where("userId", "==", feedback.userId)
    .where(
      "timestamp",
      ">=",
      admin.firestore.Timestamp.fromMillis(Date.now() - timeWindow)
    )
    .get();

  if (recentFeedback.size >= threshold) {
    // Queue a recommendation refresh
    const refreshTask = {
      userId: feedback.userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      priority: "high",
      reason: "interaction_threshold_reached",
    };

    await db.collection("recommendationRefreshQueue").add(refreshTask);
  }
}

function getPeriodDuration(period: "daily" | "weekly" | "monthly"): number {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  switch (period) {
    case "daily":
      return ONE_DAY;
    case "weekly":
      return 7 * ONE_DAY;
    case "monthly":
      return 30 * ONE_DAY;
    default:
      return ONE_DAY;
  }
}

function initializeMetrics(): RecommendationMetrics["metrics"] {
  return {
    totalRecommendations: 0,
    interactedRecommendations: 0,
    clickThroughRate: 0,
    averageRelevanceScore: 0,
    conversionRate: 0,
  };
}

function isInteractionMetric(action: string): boolean {
  return ["click", "save"].includes(action);
}