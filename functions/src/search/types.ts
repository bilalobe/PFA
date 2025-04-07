export interface SearchOptions {
  vectorSearch?: boolean;
  limit?: number;
  threshold?: number;
  filters?: string[];
  page?: number;
  hitsPerPage?: number;
  attributesToRetrieve?: string[];
  attributesToHighlight?: string[];
}

export interface SearchResult {
  objectID: string;
  _vectorScore?: number;
  _highlightResult?: {
    [key: string]: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    };
  };
  [key: string]: any;
}

export interface VectorSearchResult {
  id: string;
  similarity: number;
  data: {
    [key: string]: any;
  };
}

export interface EmbeddingDocument {
  embedding: number[];
  timestamp: FirebaseFirestore.Timestamp;
}

export interface IndexableDocument {
  title: string;
  description: string;
  content?: string;
  tags?: string[];
  category?: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  [key: string]: any;
}