import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot, 
  FirestoreError,
  DocumentData,
  WithFieldValue,
  UpdateData,
  Query,
  QuerySnapshot,
  DocumentReference
} from 'firebase/firestore'; 
import { db } from '../firebaseConfig'; 

// --- Interfaces ---
interface UseFirestoreHookResult<T extends DocumentData> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  addDocument: (newDoc: WithFieldValue<T>) => Promise<void>; 
  updateDocument: (id: string, updatedDoc: UpdateData<T>) => Promise<void>; 
  deleteDocument: (id: string) => Promise<void>;
  createSubcollectionDocument?: (parentCollectionPath: string, parentDocumentId: string, subcollectionPath: string, data: T) => Promise<DocumentReference<DocumentData>>;
}

interface FirestoreDocumentHook<T> {
  docData: T | null;
  loading: boolean;
  error: string | null;
}

interface FirestoreCollectionHook<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

// --- useFirestoreCollectionData Hook ---
export const useFirestoreCollectionData = <T extends DocumentData>(
  collectionName: string,
  queryFn?: (collectionRef: Query<DocumentData>) => Query<DocumentData>
): FirestoreCollectionHook<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let unsubscribe: () => void;

    const collectionRef = collection(db, collectionName);
    const queryRef = queryFn ? queryFn(collectionRef as unknown as Query<DocumentData>) : collectionRef as unknown as Query<DocumentData>;

    unsubscribe = onSnapshot(
      queryRef as Query<DocumentData>,
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

// --- useFirestore Hook  ---
export const useFirestore = <T extends DocumentData>(collectionName: string): UseFirestoreHookResult<T> => {
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const { data, loading: dataLoading, error: dataError } = useFirestoreCollectionData<T>(collectionName); 

  const addDocument = async (newDoc: WithFieldValue<T>) => {
    setLoading(true);
    try {
        await addDoc(collection(db, collectionName), newDoc); 
    } catch (error: any) {
        console.error('Error adding document: ', error);
        setError(error.message); 
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (id: string, updatedDoc: UpdateData<T>) =>  {
    setLoading(true); 
    try {
      await updateDoc(doc(db, collectionName, id), updatedDoc);
    } catch (error: any) {
      console.error('Error updating document: ', error);
      setError(error.message); 
    } finally {
      setLoading(false); 
    }
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

  return { data, loading: loading || dataLoading, error: error || dataError, addDocument, updateDocument, deleteDocument };
};

// --- useFirestoreDocument Hook ---
export const useFirestoreDocument = <T extends DocumentData>(
  documentPath: string 
): FirestoreDocumentHook<T> => {
  const [docData, setDocData] = useState<T | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { 
    const docRef = doc(db, documentPath);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setDocData(snapshot.data() as T); 
      } else {
        setError('Document not found');
      }
      setLoading(false); 
    }, (error) => {
      console.error("Error fetching document:", error);
      setError(error.message); 
      setLoading(false); 
    }); 

    return () => unsubscribe();
  }, [documentPath]);

  return { docData, loading, error }; 
};
