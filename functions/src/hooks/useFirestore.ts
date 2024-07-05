import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  FirestoreError 
} from 'firebase/firestore';
import db from '../firebaseConfig.js';

interface FirestoreHook<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  addDocument: (newDoc: T) => Promise<void>;
  updateDocument: (id: string, updatedDoc: Partial<T>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useFirestore = <T>(collectionName: string): FirestoreHook<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
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

  const addDocument = async (newDoc: T) => {
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

  const updateDocument = async (id: string, updatedDoc: Partial<T>) => {
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