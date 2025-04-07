import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, admin as firebaseAdmin } from '../firebaseConfig';
import * as z from 'zod';
import { Registry } from '@genkit-ai/core';
import { generate } from '@genkit-ai/ai';
import { gemini15Pro } from '@genkit-ai/googleai';
import { generateSearchEmbedding } from "../search/vectorUtils";

const SIMILARITY_THRESHOLD = 0.85;

// Initialize global registry
const globalRegistry = new Registry();

// Define schema for similarity detection request
const SimilarityCheckSchema = z.object({
  studentSubmission: z.string().min(50, "Submission must be at least 50 characters"),
  referenceContent: z.string().optional(),
  courseId: z.string(),
  assignmentId: z.string(),
  studentId: z.string(),
});

interface SimilarityResult {
  similarityScore: number;
  potentialPlagiarism: boolean;
  flaggedSections: {
    studentText: string;
    matchedSource?: string;
    similarityScore: number;
  }[];
  analysisExplanation: string;
}

/**
 * Analyzes submission for potential academic integrity issues
 * Uses AI to detect plagiarism patterns and unusual submission characteristics
 */
export const checkSubmissionIntegrity = functions.https.onCall(async (data, context) => {
  // Ensure authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    // Validate input data
    const validatedData = SimilarityCheckSchema.parse(data);
    const { studentSubmission, referenceContent, courseId, assignmentId, studentId } = validatedData;
    
    // Validate permissions (only teachers, admins or the student themselves)
    const isTeacher = await hasRole(context.auth.uid, 'teacher');
    const isAdmin = await hasRole(context.auth.uid, 'admin');
    const isSelf = context.auth.uid === studentId;
    
    if (!isTeacher && !isAdmin && !isSelf) {
      throw new functions.https.HttpsError(
        'permission-denied', 
        'Only teachers, admins, or the student can check submission integrity'
      );
    }
    
    // Get reference materials for this assignment
    let referenceSources = [];
    if (!referenceContent) {
      const assignmentRef = await db.collection('courses').doc(courseId)
        .collection('assignments').doc(assignmentId).get();
      
      if (assignmentRef.exists) {
        const assignmentData = assignmentRef.data();
        referenceSources = assignmentData?.referenceMaterials || [];
      }
    } else {
      referenceSources = [referenceContent];
    }
    
    // Format reference content
    const formattedReferences = referenceSources.length > 0 
      ? referenceSources.join('\n\n===SOURCE SEPARATOR===\n\n')
      : "No reference materials provided";
    
    // Use AI to analyze the submission
    const response = await generate(globalRegistry, {
      model: gemini15Pro,
      prompt: [
        `As an academic integrity analyzer, evaluate the following student submission for potential plagiarism or AI generation indicators. 
        
        STUDENT SUBMISSION:
        ${studentSubmission}
        
        REFERENCE MATERIALS (if available):
        ${formattedReferences}
        
        Analyze the submission for:
        1. Similarity to provided reference materials
        2. Stylistic inconsistencies suggesting multiple authors
        3. AI-generated content patterns
        4. Unusual phrasing or vocabulary shifts
        
        Provide a structured analysis with:
        - Overall similarity score (0-100)
        - Whether this should be flagged for review (true/false)
        - Specific sections that appear suspicious with their similarity scores
        - Brief explanation of your conclusion
        
        Format your response as a valid JSON object with the following keys:
        {
          "similarityScore": (number between 0-100),
          "potentialPlagiarism": (boolean),
          "flaggedSections": [array of {studentText, matchedSource, similarityScore}],
          "analysisExplanation": (string explanation)
        }`
      ],
      output: {
        schema: z.object({
          similarityScore: z.number().min(0).max(100),
          potentialPlagiarism: z.boolean(),
          flaggedSections: z.array(z.object({
            studentText: z.string(),
            matchedSource: z.string().optional(),
            similarityScore: z.number().min(0).max(100)
          })),
          analysisExplanation: z.string()
        })
      }
    });

    const analysisResult = response.output as SimilarityResult;
    
    // Store the analysis result
    await db.collection('submissions').doc(`${assignmentId}_${studentId}`).collection('integrityChecks').add({
      analysisResult,
      checkedBy: context.auth.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // If highly suspicious (score > 80), create notification for teachers
    if (analysisResult.similarityScore > 80) {
      const courseDoc = await db.collection('courses').doc(courseId).get();
      const courseData = courseDoc.data();
      const instructorId = courseData?.instructor;
      
      if (instructorId) {
        await db.collection('notifications').add({
          userId: instructorId,
          title: 'Potential Academic Integrity Issue',
          body: `A submission for your course "${courseData?.title}" has triggered an integrity alert with a ${analysisResult.similarityScore}% similarity score`,
          type: 'integrity',
          relatedId: assignmentId,
          studentId,
          courseId,
          isRead: false,
          requiresAction: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          link: `/courses/${courseId}/assignments/${assignmentId}/submissions/${studentId}`,
          data: { similarityScore: analysisResult.similarityScore }
        });
      }
    }
    
    return analysisResult;
    
  } catch (error) {
    console.error('Error checking submission integrity:', error);
    throw new functions.https.HttpsError('internal', 'Error analyzing submission integrity');
  }
});

/**
 * Helper to check if a user has a specific role
 */
async function hasRole(userId: string, role: string): Promise<boolean> {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return false;
  const userData = userDoc.data();
  return userData?.roles?.includes(role) || false;
}

/**
 * Plagiarism detection module
 */
export const checkPlagiarism = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated to check plagiarism"
    );
  }

  const { text, collectionName } = data;

  if (!text || typeof text !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Text to check must be a non-empty string"
    );
  }

  try {
    // Generate embedding for the submitted text
    const textEmbedding = await generateSearchEmbedding(text);

    // Get embeddings for comparison
    const existingDocs = await db
      .collection("embeddings")
      .doc(collectionName)
      .collection("vectors")
      .get();

    // Check similarity with existing content
    const similarities = await Promise.all(
      existingDocs.docs.map(async (doc) => {
        const { embedding } = doc.data();
        const similarity = calculateSimilarity(textEmbedding, embedding);
        
        if (similarity > SIMILARITY_THRESHOLD) {
          const originalDoc = await db
            .collection(collectionName)
            .doc(doc.id)
            .get();

          return {
            similarity,
            matchedDocument: {
              id: doc.id,
              ...originalDoc.data(),
            },
          };
        }
        return null;
      })
    );

    // Filter out null results and sort by similarity
    const matches = similarities
      .filter(Boolean)
      .sort((a, b) => b!.similarity - a!.similarity);

    if (matches.length > 0) {
      // Log potential plagiarism for review
      await db.collection("plagiarismReports").add({
        userId: context.auth.uid,
        submittedText: text,
        matches: matches,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: "pending",
      });

      return {
        isPlagiarized: true,
        matches: matches,
        message: "Potential plagiarism detected. The content will be reviewed.",
      };
    }

    return {
      isPlagiarized: false,
      matches: [],
      message: "No potential plagiarism detected.",
    };

  } catch (error) {
    functions.logger.error("Plagiarism check error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to check for plagiarism",
      { originalError: error instanceof Error ? error.message : "Unknown error" }
    );
  }
});

function calculateSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same dimension");
  }

  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  return dotProduct / (norm1 * norm2);
}

// Trigger to index new content for plagiarism detection
export const indexContentForPlagiarism = functions.firestore
  .document("{collection}/{docId}")
  .onCreate(async (snapshot, context) => {
    const { collection } = context.params;
    const data = snapshot.data();

    // Skip certain collections
    if (["embeddings", "plagiarismReports"].includes(collection)) {
      return;
    }

    try {
      // Extract text content based on document type
      const textToIndex = extractTextContent(data);
      
      if (!textToIndex) {
        return;
      }

      // Generate and store embedding
      const embedding = await generateSearchEmbedding(textToIndex);
      await db
        .collection("embeddings")
        .doc(collection)
        .collection("vectors")
        .doc(snapshot.id)
        .set({
          embedding,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

    } catch (error) {
      functions.logger.error("Error indexing content for plagiarism:", error);
    }
  });

function extractTextContent(data: any): string {
  const textFields = ["content", "description", "text", "body"];
  const extractedText = textFields
    .map(field => data[field])
    .filter(Boolean)
    .join(" ");

  return extractedText.toLowerCase();
}