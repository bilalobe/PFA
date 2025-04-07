import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { analyzeSentiment } from "../ai/sentiment";
import { generateSearchEmbedding } from "../search/vectorUtils";

const db = admin.firestore();

interface ContentReport {
  contentId: string;
  contentType: "post" | "comment" | "forum" | "profile";
  reportedBy: string;
  reason: string;
  context?: string;
  status: "pending" | "reviewed" | "actioned" | "dismissed";
}

export const reportContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated to report content"
    );
  }

  const { contentId, contentType, reason, context: reportContext } = data;

  try {
    // Create report
    const report: ContentReport = {
      contentId,
      contentType,
      reportedBy: context.auth.uid,
      reason,
      context: reportContext,
      status: "pending",
    };

    // Store report
    await db.collection("contentReports").add({
      ...report,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // If multiple reports exist, escalate priority
    const existingReports = await db
      .collection("contentReports")
      .where("contentId", "==", contentId)
      .where("status", "==", "pending")
      .get();

    if (existingReports.size > 2) {
      // Notify moderators
      await notifyModerators(contentId, contentType, existingReports.size);
    }

    return { success: true, message: "Content reported successfully" };
  } catch (error) {
    functions.logger.error("Error reporting content:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to report content",
      { originalError: error instanceof Error ? error.message : "Unknown error" }
    );
  }
});

export const moderateContent = functions.https.onCall(async (data, context) => {
  // Verify moderator permissions
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated to moderate content"
    );
  }

  const userRef = await db.collection("users").doc(context.auth.uid).get();
  const userData = userRef.data();

  if (!userData?.roles?.includes("moderator")) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be a moderator to perform this action"
    );
  }

  const { reportId, action, reason } = data;

  try {
    const reportRef = db.collection("contentReports").doc(reportId);
    const report = (await reportRef.get()).data() as ContentReport;

    if (!report) {
      throw new functions.https.HttpsError(
        "not-found",
        "Report not found"
      );
    }

    switch (action) {
      case "remove":
        await removeContent(report.contentId, report.contentType);
        break;
      case "warn":
        await warnUser(report.contentId, report.contentType, reason);
        break;
      case "dismiss":
        // No action needed on content
        break;
      default:
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid moderation action"
        );
    }

    // Update report status
    await reportRef.update({
      status: action === "dismiss" ? "dismissed" : "actioned",
      moderatedBy: context.auth.uid,
      moderationTimestamp: admin.firestore.FieldValue.serverTimestamp(),
      moderationReason: reason,
    });

    return { success: true, message: "Moderation action completed" };
  } catch (error) {
    functions.logger.error("Moderation error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to moderate content",
      { originalError: error instanceof Error ? error.message : "Unknown error" }
    );
  }
});

// Automated content monitoring
export const monitorNewContent = functions.firestore
  .document("{collection}/{docId}")
  .onCreate(async (snapshot, context) => {
    const { collection } = context.params;
    const data = snapshot.data();

    // Skip monitoring for certain collections
    if (!["posts", "comments", "forums", "profiles"].includes(collection)) {
      return;
    }

    try {
      // Analyze content sentiment
      const textContent = extractTextContent(data);
      const sentiment = await analyzeSentiment(textContent);

      // If sentiment is very negative, create automated report
      if (sentiment.score < -0.7 || sentiment.toxicity > 0.8) {
        await db.collection("contentReports").add({
          contentId: snapshot.id,
          contentType: collection.slice(0, -1) as ContentReport["contentType"],
          reportedBy: "system",
          reason: "Automated detection: Potentially harmful content",
          context: `Sentiment score: ${sentiment.score}, Toxicity: ${sentiment.toxicity}`,
          status: "pending",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Notify moderators for high-priority cases
        if (sentiment.toxicity > 0.9) {
          await notifyModerators(snapshot.id, collection, 1, "High toxicity content detected");
        }
      }

      // Store sentiment analysis results
      await snapshot.ref.update({
        sentimentAnalysis: sentiment,
      });
    } catch (error) {
      functions.logger.error("Content monitoring error:", error);
    }
  });

async function notifyModerators(
  contentId: string,
  contentType: string,
  reportCount: number,
  reason: string = "Multiple reports received"
) {
  // Get all moderators
  const moderators = await db
    .collection("users")
    .where("roles", "array-contains", "moderator")
    .get();

  // Create notifications
  const notifications = moderators.docs.map((mod) =>
    db.collection("notifications").add({
      userId: mod.id,
      type: "moderation",
      contentId,
      contentType,
      message: `${contentType} requires review - ${reason} (${reportCount} reports)`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      priority: reportCount > 5 ? "high" : "normal",
    })
  );

  await Promise.all(notifications);
}

async function removeContent(contentId: string, contentType: string) {
  const contentRef = db.collection(contentType + "s").doc(contentId);
  await contentRef.update({
    status: "removed",
    removedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function warnUser(contentId: string, contentType: string, reason: string) {
  const contentRef = db.collection(contentType + "s").doc(contentId);
  const content = await contentRef.get();
  const userId = content.data()?.userId || content.data()?.authorId;

  if (userId) {
    await db.collection("userWarnings").add({
      userId,
      contentId,
      contentType,
      reason,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create notification for user
    await db.collection("notifications").add({
      userId,
      type: "warning",
      contentId,
      contentType,
      message: `Your ${contentType} has been flagged - ${reason}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
  }
}

function extractTextContent(data: any): string {
  return [
    data.content,
    data.text,
    data.body,
    data.description,
    data.title,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}