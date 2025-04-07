import { vertexAIClient } from "../utils/vertexai";
import * as admin from "firebase-admin";

const db = admin.firestore();
const EMBEDDING_DIMENSION = 768; // Dimension of the embeddings

interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
  filters?: string[];
}

export async function generateSearchEmbedding(text: string): Promise<number[]> {
  try {
    const response = await vertexAIClient.generateEmbedding({
      text: text,
    });
    return response.embeddings;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

export async function storeEmbedding(
  collection: string,
  docId: string,
  embedding: number[]
): Promise<void> {
  const embeddingDoc = {
    embedding,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db
    .collection("embeddings")
    .doc(collection)
    .collection("vectors")
    .doc(docId)
    .set(embeddingDoc);
}

export async function deleteEmbedding(
  collection: string,
  docId: string
): Promise<void> {
  await db
    .collection("embeddings")
    .doc(collection)
    .collection("vectors")
    .doc(docId)
    .delete();
}

export async function performVectorSearch(
  collection: string,
  queryEmbedding: number[],
  options: VectorSearchOptions = {}
): Promise<any[]> {
  const { limit = 10, threshold = 0.7, filters = [] } = options;

  // Get all embeddings for the collection
  const vectorsRef = db
    .collection("embeddings")
    .doc(collection)
    .collection("vectors");
  
  const vectors = await vectorsRef.get();
  
  // Calculate cosine similarity with query embedding
  const results = await Promise.all(
    vectors.docs.map(async (doc) => {
      const { embedding } = doc.data();
      const similarity = calculateCosineSimilarity(queryEmbedding, embedding);
      
      // Get the original document data
      const originalDoc = await db
        .collection(collection)
        .doc(doc.id)
        .get();

      return {
        id: doc.id,
        similarity,
        data: originalDoc.data(),
      };
    })
  );

  // Filter and sort results
  return results
    .filter((result) => result.similarity >= threshold)
    .filter((result) => {
      if (!filters.length) return true;
      return filters.every((filter) => applyFilter(result.data, filter));
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same dimension");
  }

  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  return dotProduct / (norm1 * norm2);
}

function applyFilter(data: any, filter: string): boolean {
  const [field, operator, value] = filter.split(":");
  
  if (!data.hasOwnProperty(field)) return false;
  
  switch (operator) {
    case "eq":
      return data[field] === value;
    case "gt":
      return data[field] > Number(value);
    case "lt":
      return data[field] < Number(value);
    case "contains":
      return data[field].includes(value);
    default:
      return false;
  }
}