import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestore = () => {
  // Example usage (adapt based on your components' needs)
  const fetchDocuments = async (collectionName: string) => {
    try {
      const snapshot = await getDocs(collection(db, collectionName)); 
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); 
    } catch (error) {
      console.error('Error fetching documents:', error); 
      // Handle error
    }
  };

  const fetchDocument = async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId); 
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() };
      } else {
        return null; // Handle case when document doesn't exist
      }
    } catch (error) {
      console.error('Error fetching document:', error); 
      // Handle error 
    }
  }; 

  const createDocument = async (collectionName: string, data: any) => { 
    try {
      const docRef = await addDoc(collection(db, collectionName), data); 
      return { id: docRef.id, ...data }; 
    } catch (error) {
      console.error('Error creating document:', error);
      // Handle error
    }
  };

  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, docId); 
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating document:', error);
      // Handle error
    }
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      // Handle error 
    }
  };

  // Add the following for Real-time Updates
  const useDocumentData = (collectionName: string, docId: string) => { 
    const [document, setDocument] = useState<any | null>(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onSnapshot(doc(db, collectionName, docId), (snapshot) => {
        if (snapshot.exists()) {
          setDocument({ id: snapshot.id, ...snapshot.data() });
        } else {
          setDocument(null); 
        }
        setLoading(false); 
      });
      // Cleanup
      return () => unsubscribe(); 
    }, [collectionName, docId]);

    return { document, loading };
  };

  const useCollectionData = (collectionName: string) => { 
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
        setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); 
        setLoading(false); 
      });
      return () => unsubscribe(); 
    }, [collectionName]);

    return { documents, loading };
  };

  return { 
    fetchDocuments, 
    fetchDocument, 
    createDocument, 
    updateDocument, 
    deleteDocument,
    useDocumentData, // Real-time data for a single document
    useCollectionData // Real-time data for an entire collection 
  };
};