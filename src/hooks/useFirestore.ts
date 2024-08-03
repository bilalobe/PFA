import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  DocumentData,
  WithFieldValue,
  UpdateData,
  Query,
  DocumentReference,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  QuerySnapshot,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import * as z from 'zod'; // Install zod: npm install zod

// --- Interfaces ---
interface UseFirestoreHookResult<T extends DocumentData> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  addDocument: (newDoc: WithFieldValue<T>) => Promise<void | { error: z.ZodError }>;
  updateDocument: (id: string, updatedDoc: UpdateData<T>) => Promise<void | { error: z.ZodError }>;
  deleteDocument: (id: string) => Promise<void>;
  createSubcollectionDocument?: (
    parentCollectionPath: string,
    parentDocumentId: string,
    subcollectionPath: string,
    data: T
  ) => Promise<DocumentReference<DocumentData>>;
}

interface FirestoreDocumentHook<T> {
  docData: T | null;
  loading: boolean;
  error: string | null;
}

type FirestoreCollectionHook<T> = {
  data: T[] | null;
  loading: boolean;
  error: string | null;
};

// This hook retrieves collection data
export const useFirestoreCollectionData = <T extends DocumentData>(
  collectionName: string,
  queryFn?: (collectionRef: CollectionReference<DocumentData>) => Query<DocumentData>
): FirestoreCollectionHook<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let unsubscribe: () => void;

    const collectionRef: CollectionReference<DocumentData> = collection(db, collectionName);
    const queryRef: Query<DocumentData> = queryFn ? queryFn(collectionRef) : (collectionRef as unknown as Query<DocumentData>);

    unsubscribe = onSnapshot(
      queryRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as T[];
        setData(documents);
        setLoading(false);
      },
      (error: FirestoreError) => {
        console.error('Error fetching collection data:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, queryFn]);

  return { data, loading, error };
};

export const useFirestore = <T extends DocumentData>(
  collectionName: string
): UseFirestoreHookResult<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data, loading: dataLoading, error: dataError } =
    useFirestoreCollectionData<T>(collectionName);

  // Add a document to the Firestore collection with zod validation
  const addDocument = async (newDoc: WithFieldValue<T>) => {
    setLoading(true);
    try {
      const schema = getSchemaForCollection(collectionName); // Get the zod schema
      const parsedData = schema.parse(newDoc); // Parse and validate
      await addDoc(collection(db, collectionName), parsedData);
    } catch (error) {
      console.error('Error adding document:', error);
      if (error instanceof z.ZodError) {
        // Handle Zod errors - return them for display
        setLoading(false);
        return { error }; // Or use setError(error.message) if you prefer
      } else {
        setError((error as Error).message || 'Failed to add document.');
      }
    } finally {
      setLoading(false);
    }
    console.log('Document added successfully');
    return;
  };

  const updateDocument = async (id: string, updatedDoc: UpdateData<T>) => {
    setLoading(true);
    try {
      const schema = getSchemaForCollection(collectionName);
      const parsedData = schema.parse(updatedDoc);
      await updateDoc(doc(db, collectionName, id), parsedData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setLoading(false);
        return { error };
      } else {
        // Generic error handling
        console.error('Error updating document', error);
        setError('Failed to update document');
      }
    } finally {
      setLoading(false);
    }
    console.log('Document updated successfully');
    return;
  };

  const deleteDocument = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error: any) {
      console.error('Error deleting document: ', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createSubcollectionDocument = async (
    parentCollectionPath: string,
    parentDocumentId: string,
    subcollectionPath: string,
    data: T
  ) => {
    try {
      const subCollectionRef = collection(
        db,
        parentCollectionPath,
        parentDocumentId,
        subcollectionPath
      );
      const docRef = await addDoc(subCollectionRef, data);
      return docRef;
    } catch (error) {
      // Handle the error
      console.error(
        `Error creating subcollection document in ${parentCollectionPath}/${parentDocumentId}/${subcollectionPath}`,
        error
      );
      throw error;
    }
  };

  return {
    data,
    loading: loading || dataLoading,
    error: error || dataError,
    addDocument,
    updateDocument,
    deleteDocument,
    createSubcollectionDocument,
  };
};

// This hook fetches a single Firestore document
export const useFirestoreDocument = <T extends DocumentData>(
  documentPath: string,
  docId?: string // Add docId parameter here if needed
): FirestoreDocumentHook<T> => {
  const [docData, setDocData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      // If no docId is provided, just return
      return;
    }

    // Get a reference to the Firestore document
    const docRef = doc(db, documentPath, docId);

    // Set up a real-time listener (using onSnapshot) to the document
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setDocData(snapshot.data() as T);
        } else {
          setError('Document not found.'); // Or handle it differently
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [documentPath, docId]);

  return { docData, loading, error };
};

// --- Helper Function to Get Zod Schema ---
// Add or update the schema mapping based on your collections
const getSchemaForCollection = (collectionName: string) => {
  switch (collectionName) {
    case 'courses':
      return z.object({
        title: z.string().min(3, 'Course title must be at least 3 characters').max(100),
        description: z.string().min(10).max(500),
        createdAt: z.date(),
        instructor: z.string(),
      });
    case 'users':
      return z.object({
        username: z.string().min(3).max(20),
        email: z.string().email(),
        // ... add validation for bio, profilePicture, and other fields
      });
    default:
      throw new Error(`No schema defined for collection: ${collectionName}`);
  }
};
