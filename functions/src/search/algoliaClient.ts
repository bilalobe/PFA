import algoliasearch from "algoliasearch";
import * as functions from "firebase-functions";

// Initialize the Algolia client
const ALGOLIA_APP_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
  throw new Error("Algolia configuration is missing");
}

export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

// Collections that support search
export const SEARCH_ENABLED_COLLECTIONS = [
  "courses",
  "forums",
  "posts",
  "resources",
  "users",
];

// Collections that should not be indexed
export const EXCLUDED_COLLECTIONS = [
  "embeddings",
  "tokens",
  "analytics",
  "settings",
];

// Collections that support vector search
export const VECTOR_ENABLED_COLLECTIONS = [
  "courses",
  "forums",
  "resources",
];

// Extract searchable text from different document types
export function extractSearchableText(data: any): string {
  const searchableFields = [
    "title",
    "description",
    "content",
    "tags",
    "category",
    "name",
  ];

  return searchableFields
    .map(field => data[field])
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

// Merge and deduplicate search results
export function mergeSearchResults(textResults: any[], vectorResults: any[]): any[] {
  const seenIds = new Set();
  const mergedResults = [];

  // Process text search results first (they usually have higher precision)
  for (const result of textResults) {
    seenIds.add(result.objectID);
    mergedResults.push(result);
  }

  // Add vector search results that weren't found in text search
  for (const result of vectorResults) {
    if (!seenIds.has(result.id)) {
      seenIds.add(result.id);
      mergedResults.push({
        objectID: result.id,
        ...result.data,
        _vectorScore: result.similarity,
      });
    }
  }

  return mergedResults;
}