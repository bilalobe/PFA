import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { RecommendationParams, UserInteractionPatterns } from "./types";

const db = admin.firestore();

export const computeRecommendations = functions.firestore
  .document("recommendationRefreshQueue/{taskId}")
  .onCreate(async (snapshot, context) => {
    const task = snapshot.data();
    const userId = task.userId;

    try {
      // Get user data and interaction patterns
      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error(`User ${userId} not found`);
      }

      const interactionPatterns = userData.interactionPatterns || {};
      
      // Compute personalized recommendations
      const recommendations = await generatePersonalizedRecommendations(
        userId,
        interactionPatterns
      );

      // Store recommendations
      const batch = db.batch();
      const userRecsRef = db
        .collection("recommendations")
        .doc(userId)
        .collection("active");

      // Delete existing recommendations
      const existingRecs = await userRecsRef.get();
      existingRecs.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Add new recommendations
      recommendations.forEach((rec) => {
        const recRef = userRecsRef.doc();
        batch.set(recRef, {
          ...rec,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "active",
        });
      });

      await batch.commit();

      // Update task status
      await snapshot.ref.update({
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        recommendationsCount: recommendations.length,
      });

    } catch (error) {
      functions.logger.error("Error computing recommendations:", error);
      await snapshot.ref.update({
        status: "error",
        error: error.message,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

async function generatePersonalizedRecommendations(
  userId: string,
  interactionPatterns: UserInteractionPatterns
): Promise<RecommendationParams[]> {
  // Get user's enrolled courses
  const enrollments = await db
    .collection("enrollments")
    .where("userId", "==", userId)
    .get();

  const enrolledCourseIds = enrollments.docs.map(doc => doc.data().courseId);

  // Get user's completed content
  const completedContent = await db
    .collection("progress")
    .where("userId", "==", userId)
    .where("status", "==", "completed")
    .get();

  const completedContentIds = completedContent.docs.map(doc => doc.data().contentId);

  // Query available content based on user patterns
  const contentQuery = db.collection("content")
    .where("status", "==", "published")
    .where("courseId", "in", enrolledCourseIds)
    .where("id", "not-in", completedContentIds)
    .limit(50);

  const availableContent = await contentQuery.get();

  // Score and rank content based on user patterns
  const scoredContent = availableContent.docs.map(doc => {
    const content = doc.data();
    let score = 0;

    // Score based on content type preferences
    if (content.type && interactionPatterns.preferredContentTypes?.[content.type]) {
      score += interactionPatterns.preferredContentTypes[content.type] * 2;
    }

    // Score based on tags
    if (content.tags) {
      content.tags.forEach(tag => {
        if (interactionPatterns.contentTags?.[tag]) {
          score += interactionPatterns.contentTags[tag];
        }
      });
    }

    // Adjust score based on difficulty level match
    if (content.difficultyLevel && userData?.skillLevel) {
      score += (10 - Math.abs(content.difficultyLevel - userData.skillLevel)) / 2;
    }

    // Add some randomization to prevent echo chambers
    score += Math.random() * 2;

    return {
      contentId: doc.id,
      type: content.type,
      title: content.title,
      description: content.description,
      tags: content.tags,
      courseId: content.courseId,
      score,
      recommendedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
  });

  // Sort by score and return top recommendations
  return scoredContent
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(({ score, ...rec }) => rec);
}