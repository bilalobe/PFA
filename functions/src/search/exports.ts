// filepath: k:\PFA\functions\src\search\exports.ts
// This file consolidates exports from all search-related modules

// Export search functions from this module
export * from './vectorSearch';
export * from './searchFunctions';

// Re-export types
export * from './types';

// Export core functions defined in this file
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { searchClient } from "./algoliaClient";
import { generateSearchEmbedding } from "./vectorUtils";
import { validateSearchQuery } from "../utils/validation";

// Constants
const EXCLUDED_COLLECTIONS = ['logs', 'stats', 'userPresence', 'embeddings'];
const VECTOR_ENABLED_COLLECTIONS = ['courses', 'resources', 'forums', 'lessons'];

export const searchContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated to perform search"
    );
  }

  const { query, collection, options = {} } = data;
  validateSearchQuery(query, collection);

  try {
    // Standard text search using Algolia
    const textResults = await searchClient
      .initIndex(collection)
      .search(query, options);

    // Vector search if enabled for this collection
    let vectorResults = [];
    if (options.vectorSearch) {
      const embedding = await generateSearchEmbedding(query);
      vectorResults = await performVectorSearch(collection, embedding, options);
    }

    // Merge and deduplicate results
    return mergeSearchResults(textResults.hits, vectorResults);
  } catch (error) {
    functions.logger.error("Search error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to perform search",
      { originalError: error instanceof Error ? error.message : "Unknown error" }
    );
  }
});

// Index new content for search
export const indexContent = functions.firestore
  .document("{collection}/{docId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    const { collection } = context.params;

    // Skip indexing for excluded collections
    if (EXCLUDED_COLLECTIONS.includes(collection)) {
      return;
    }

    try {
      // Index in Algolia
      const algoliaObject = {
        objectID: snapshot.id,
        ...data,
      };
      await searchClient.initIndex(collection).saveObject(algoliaObject);

      // Generate and store vector embedding if enabled
      if (VECTOR_ENABLED_COLLECTIONS.includes(collection)) {
        const embedding = await generateSearchEmbedding(
          extractSearchableText(data)
        );
        await storeEmbedding(collection, snapshot.id, embedding);
      }
    } catch (error) {
      functions.logger.error("Indexing error:", error);
    }
  });

// Update indexed content
export const updateIndexedContent = functions.firestore
  .document("{collection}/{docId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const { collection } = context.params;

    if (EXCLUDED_COLLECTIONS.includes(collection)) {
      return;
    }

    try {
      // Update in Algolia
      const algoliaObject = {
        objectID: change.after.id,
        ...newData,
      };
      await searchClient.initIndex(collection).saveObject(algoliaObject);

      // Update vector embedding if enabled
      if (VECTOR_ENABLED_COLLECTIONS.includes(collection)) {
        const embedding = await generateSearchEmbedding(
          extractSearchableText(newData)
        );
        await storeEmbedding(collection, change.after.id, embedding);
      }
    } catch (error) {
      functions.logger.error("Index update error:", error);
    }
  });

// Remove deleted content from search
export const removeIndexedContent = functions.firestore
  .document("{collection}/{docId}")
  .onDelete(async (snapshot, context) => {
    const { collection } = context.params;

    if (EXCLUDED_COLLECTIONS.includes(collection)) {
      return;
    }

    try {
      // Remove from Algolia
      await searchClient.initIndex(collection).deleteObject(snapshot.id);

      // Remove vector embedding if it exists
      if (VECTOR_ENABLED_COLLECTIONS.includes(collection)) {
        await deleteEmbedding(collection, snapshot.id);
      }
    } catch (error) {
      functions.logger.error("Index deletion error:", error);
    }
  });

// Helper functions that were previously undefined or imported from elsewhere
// These would normally be defined in appropriate modules, but are included here as placeholders
async function performVectorSearch(collection, embedding, options) {
  // Implementation would come from vectorSearch.ts or vectorUtils.ts
  // Placeholder implementation
  return [];
}

function mergeSearchResults(textResults, vectorResults) {
  // Placeholder implementation
  const allResults = [...textResults];
  
  for (const vResult of vectorResults) {
    if (!allResults.some(r => r.objectID === vResult.objectID)) {
      allResults.push(vResult);
    }
  }
  
  return allResults;
}

function extractSearchableText(data) {
  // Extract text content from document for embedding
  return Object.values(data)
    .filter(v => typeof v === 'string')
    .join(' ');
}

async function storeEmbedding(collection, docId, embedding) {
  // Store embedding in appropriate collection
  await admin.firestore().collection('embeddings').doc(`${collection}_${docId}`).set({
    collection,
    docId,
    embedding,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function deleteEmbedding(collection, docId) {
  // Remove embedding from storage
  await admin.firestore().collection('embeddings').doc(`${collection}_${docId}`).delete();
}