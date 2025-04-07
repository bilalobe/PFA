import { searchClient } from '../../utils/algolia';
import { handleApiError } from '../utils/errorHandling';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface SearchOptions {
  filters?: string;
  page?: number;
  hitsPerPage?: number;
  attributesToRetrieve?: string[];
}

export const searchApi = {
  // Search using Algolia
  search: async (indexName: string, queryText: string, options?: SearchOptions) => {
    try {
      const index = searchClient.initIndex(indexName);
      const response = await index.search(queryText, options);
      return response.hits;
    } catch (error) {
      handleApiError(error, `Failed to search in index ${indexName}.`);
      return [];
    }
  },

  // Fulltext search in Firestore (fallback method)
  searchFirestore: async (collection: string, field: string, queryText: string, limit = 10) => {
    try {
      // This is a simplistic implementation, as Firestore doesn't support full-text search natively
      // In a real app, you'd use Algolia, ElasticSearch, or a serverless function
      const collectionRef = collection(db, collection);
      const q = query(
        collectionRef, 
        where(field, '>=', queryText),
        where(field, '<=', queryText + '\uf8ff'), // Unicode trick for prefix searching
        limit(limit)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleApiError(error, `Failed to search in Firestore collection ${collection}.`);
      return [];
    }
  },

  // Vector search for semantic matching 
  semanticSearch: async (indexName: string, embedding: number[], limit = 5) => {
    try {
      // Call your vector search Cloud Function
      // This is a stub - implementation would depend on your vector DB strategy
      // (e.g., Pinecone, Firebase Vector Search, etc.)
      const vectorSearchFn = httpsCallable(functions, 'vectorSearch');
      const response = await vectorSearchFn({ 
        index: indexName, 
        embedding,
        limit 
      });
      
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to perform vector search in ${indexName}.`);
      return [];
    }
  }
};

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';

export default searchApi;