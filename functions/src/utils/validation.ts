import * as functions from "firebase-functions";
import { SEARCH_ENABLED_COLLECTIONS } from "../search/algoliaClient";

export function validateSearchQuery(query: any, collection: any): void {
  // Validate query string
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Search query must be a non-empty string"
    );
  }

  // Validate collection
  if (!collection || typeof collection !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Collection name must be a string"
    );
  }

  // Check if collection supports search
  if (!SEARCH_ENABLED_COLLECTIONS.includes(collection)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Search is not supported for collection: ${collection}`
    );
  }
}

export function validateSearchOptions(options: any): void {
  if (options.vectorSearch && typeof options.vectorSearch !== "boolean") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "vectorSearch option must be a boolean"
    );
  }

  if (options.limit && (!Number.isInteger(options.limit) || options.limit < 1)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "limit must be a positive integer"
    );
  }

  if (options.threshold && (typeof options.threshold !== "number" || options.threshold < 0 || options.threshold > 1)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "threshold must be a number between 0 and 1"
    );
  }

  if (options.filters && !Array.isArray(options.filters)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "filters must be an array"
    );
  }
}

export function validateIndexData(data: any): void {
  if (!data || typeof data !== "object") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Index data must be an object"
    );
  }

  const requiredFields = ["title", "description"];
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Missing required fields: ${missingFields.join(", ")}`
    );
  }
}