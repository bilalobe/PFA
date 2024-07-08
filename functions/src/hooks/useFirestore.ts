import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  FirestoreError, 
  DocumentData,
  WithFieldValue,
  UpdateData
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface FirestoreHook<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  addDocument: (newDoc: T) => Promise<void>;
  updateDocument: (id: string, updatedDoc: UpdateData<T>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

interface FirestoreDocumentHook<T> {
  docData: T | null;
  loading: boolean;
  error: string | null;
}

const useFirestore = <T extends DocumentData>(collectionName: string): FirestoreHook<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as T[];
        setData(documents);
        setLoading(false);
      },
      (error: FirestoreError) => {
        console.error('Error fetching documents:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  const addDocument = async (newDoc: WithFieldValue<T>) => {
    setLoading(true);
    try {
      await addDoc(collection(db, collectionName), newDoc);
    } catch (error: any) {
      console.error('Error adding document:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (id: string, updatedDoc: UpdateData<T>) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updatedDoc);
    } catch (error: any) {
      console.error('Error updating document:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error('Error deleting document:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, addDocument, updateDocument, deleteDocument };
};

export const useFirestoreDocument = <T extends DocumentData>(collectionName: string, docId: string): FirestoreDocumentHook<T> => {
  const [docData, setDocData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDocData(docSnap.data() as T);
        } else {
          setError('Document does not exist');
        }
      } catch (error: any) {
        console.error('Error fetching document:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [collectionName, docId]);

  return { docData, loading, error };
};

export { useFirestore, type FirestoreHook };
