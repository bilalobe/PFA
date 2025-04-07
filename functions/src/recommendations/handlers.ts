import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateSearchEmbedding } from "../search/vectorUtils";

const db = admin.firestore();

interface UserInteraction {
  userId: string;
  itemId: string;
  itemType: "course" | "resource" | "forum" | "quiz";
  action: "view" | "complete" | "like" | "bookmark" | "enroll";
  timestamp: FirebaseFirestore.Timestamp;
}

interface RecommendationScore {
  itemId: string;
  score: number;
  type: string;
  matchReason: string[];
}

export const generateUserRecommendations = functions.pubsub
  .schedule("every 12 hours")
  .onRun(async (context) => {
    try {
      const users = await db
        .collection("users")
        .where("isActive", "==", true)
        .get();

      const recommendationPromises = users.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const recommendations = await generateRecommendations(userId);
        
        if (recommendations.length > 0) {
          await db.collection("recommendations").doc(userId).set({
            userId,
            recommendations,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            isNew: true,
          });
        }
      });

      await Promise.all(recommendationPromises);
    } catch (error) {
      functions.logger.error("Error generating recommendations:", error);
    }
  });

async function generateRecommendations(userId: string): Promise<RecommendationScore[]> {
  try {
    // Get user's recent interactions
    const interactions = await getUserInteractions(userId);
    if (interactions.length === 0) {
      return generateDefaultRecommendations();
    }

    // Get user preferences and skill level
    const userPrefs = await getUserPreferences(userId);
    
    // Calculate content-based recommendations
    const contentBased = await getContentBasedRecommendations(
      interactions,
      userPrefs
    );

    // Calculate collaborative recommendations
    const collaborative = await getCollaborativeRecommendations(
      userId,
      interactions
    );

    // Merge and rank recommendations
    const merged = mergeRecommendations([...contentBased, ...collaborative]);
    
    // Filter out items user has already interacted with
    const userItems = new Set(interactions.map((i) => i.itemId));
    return merged.filter((rec) => !userItems.has(rec.itemId));
  } catch (error) {
    functions.logger.error("Error generating recommendations for user:", error);
    return [];
  }
}

async function getUserInteractions(userId: string): Promise<UserInteraction[]> {
  const thirtyDaysAgo = admin.firestore.Timestamp.fromMillis(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );

  const interactions = await db
    .collection("userInteractions")
    .where("userId", "==", userId)
    .where("timestamp", ">=", thirtyDaysAgo)
    .orderBy("timestamp", "desc")
    .limit(100)
    .get();

  return interactions.docs.map((doc) => doc.data() as UserInteraction);
}

async function getUserPreferences(userId: string) {
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();

  return {
    interests: userData?.interests || [],
    skillLevel: userData?.skillLevel || "beginner",
    preferredLanguages: userData?.preferredLanguages || ["en"],
    learningGoals: userData?.learningGoals || [],
  };
}

async function getContentBasedRecommendations(
  interactions: UserInteraction[],
  userPrefs: any
): Promise<RecommendationScore[]> {
  const recommendations: RecommendationScore[] = [];

  // Get embeddings for user's interests and recent interactions
  const interactionEmbeddings = await Promise.all(
    interactions.slice(0, 10).map(async (interaction) => {
      const content = await db
        .collection(interaction.itemType + "s")
        .doc(interaction.itemId)
        .get();
      return {
        embedding: await generateSearchEmbedding(
          JSON.stringify(content.data())
        ),
        weight: getInteractionWeight(interaction),
      };
    })
  );

  // Find similar content
  const similarContent = await db
    .collectionGroup("searchIndex")
    .where("type", "in", ["course", "resource", "forum"])
    .get();

  for (const doc of similarContent.docs) {
    const data = doc.data();
    let score = 0;

    // Calculate similarity with recent interactions
    for (const { embedding, weight } of interactionEmbeddings) {
      score += cosineSimilarity(embedding, data.embedding) * weight;
    }

    // Adjust score based on user preferences
    score = adjustScoreByPreferences(score, data, userPrefs);

    if (score > 0.5) {
      recommendations.push({
        itemId: doc.id,
        score,
        type: data.type,
        matchReason: getMatchReasons(data, userPrefs),
      });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 20);
}

async function getCollaborativeRecommendations(
  userId: string,
  userInteractions: UserInteraction[]
): Promise<RecommendationScore[]> {
  const recommendations: RecommendationScore[] = [];

  // Find similar users based on interaction patterns
  const similarUsers = await findSimilarUsers(userId, userInteractions);

  // Get recommendations from similar users' interactions
  for (const { userId: similarUserId, similarity } of similarUsers) {
    const interactions = await getUserInteractions(similarUserId);
    
    for (const interaction of interactions) {
      const existingRec = recommendations.find(
        (r) => r.itemId === interaction.itemId
      );

      if (existingRec) {
        existingRec.score += similarity * getInteractionWeight(interaction);
      } else {
        recommendations.push({
          itemId: interaction.itemId,
          score: similarity * getInteractionWeight(interaction),
          type: interaction.itemType,
          matchReason: ["Popular among similar learners"],
        });
      }
    }
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 20);
}

async function findSimilarUsers(
  userId: string,
  userInteractions: UserInteraction[]
): Promise<Array<{ userId: string; similarity: number }>> {
  const userItemSet = new Set(userInteractions.map((i) => i.itemId));

  const similarUsers: Array<{ userId: string; similarity: number }> = [];
  const userSnapshots = await db
    .collection("userInteractions")
    .where("userId", "!=", userId)
    .get();

  const userInteractionMap = new Map<string, Set<string>>();
  userSnapshots.docs.forEach((doc) => {
    const data = doc.data();
    if (!userInteractionMap.has(data.userId)) {
      userInteractionMap.set(data.userId, new Set());
    }
    userInteractionMap.get(data.userId)?.add(data.itemId);
  });

  for (const [otherUserId, otherItemSet] of userInteractionMap.entries()) {
    const similarity = calculateJaccardSimilarity(userItemSet, otherItemSet);
    if (similarity > 0.1) {
      similarUsers.push({ userId: otherUserId, similarity });
    }
  }

  return similarUsers.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
}

function getInteractionWeight(interaction: UserInteraction): number {
  const weights: Record<string, number> = {
    complete: 1.0,
    enroll: 0.8,
    like: 0.6,
    bookmark: 0.4,
    view: 0.2,
  };
  return weights[interaction.action] || 0.1;
}

function adjustScoreByPreferences(
  score: number,
  content: any,
  userPrefs: any
): number {
  let adjustedScore = score;

  // Boost score if content matches user's interests
  const matchingInterests = content.tags?.filter((tag: string) =>
    userPrefs.interests.includes(tag)
  ).length;
  adjustedScore *= 1 + (matchingInterests * 0.1);

  // Adjust based on skill level match
  if (content.skillLevel === userPrefs.skillLevel) {
    adjustedScore *= 1.2;
  }

  // Adjust based on language preference
  if (userPrefs.preferredLanguages.includes(content.language)) {
    adjustedScore *= 1.1;
  }

  return adjustedScore;
}

function getMatchReasons(content: any, userPrefs: any): string[] {
  const reasons: string[] = [];

  const matchingInterests = content.tags?.filter((tag: string) =>
    userPrefs.interests.includes(tag)
  );
  if (matchingInterests?.length > 0) {
    reasons.push(`Matches your interests: ${matchingInterests.join(", ")}`);
  }

  if (content.skillLevel === userPrefs.skillLevel) {
    reasons.push(`Suitable for your skill level`);
  }

  if (userPrefs.preferredLanguages.includes(content.language)) {
    reasons.push(`Available in your preferred language`);
  }

  return reasons;
}

async function generateDefaultRecommendations(): Promise<RecommendationScore[]> {
  // Get popular and highly-rated content
  const popular = await db
    .collectionGroup("analytics")
    .orderBy("viewCount", "desc")
    .limit(10)
    .get();

  return popular.docs.map((doc) => ({
    itemId: doc.ref.parent.parent?.id || "",
    score: normalizePopularityScore(doc.data().viewCount),
    type: doc.data().type,
    matchReason: ["Popular among learners"],
  }));
}

function mergeRecommendations(
  recommendations: RecommendationScore[]
): RecommendationScore[] {
  const merged = new Map<string, RecommendationScore>();

  for (const rec of recommendations) {
    if (merged.has(rec.itemId)) {
      const existing = merged.get(rec.itemId)!;
      existing.score = (existing.score + rec.score) / 2;
      existing.matchReason = [...new Set([...existing.matchReason, ...rec.matchReason])];
    } else {
      merged.set(rec.itemId, rec);
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}

function normalizePopularityScore(viewCount: number): number {
  // Normalize to a score between 0 and 1
  return Math.min(viewCount / 1000, 1);
}

function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}