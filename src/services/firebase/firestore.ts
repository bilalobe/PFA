import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  serverTimestamp,
  collectionGroup,
  QueryConstraint,
  writeBatch,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

import { db } from "../../firebaseConfig";

// Generic Firestore CRUD operations
export const firestoreService = {
  create: async <T>(collectionPath: string, data: T) => {
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating document in ${collectionPath}:`, error);
      throw error;
    }
  },
  
  get: async <T>(collectionPath: string, id: string): Promise<T & { id: string }> => {
    try {
      const docRef = doc(db, collectionPath, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Document not found: ${collectionPath}/${id}`);
      }
      
      return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
    } catch (error) {
      console.error(`Error getting document ${collectionPath}/${id}:`, error);
      throw error;
    }
  },
  
  update: async <T>(collectionPath: string, id: string, data: Partial<T>) => {
    try {
      const docRef = doc(db, collectionPath, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating document ${collectionPath}/${id}:`, error);
      throw error;
    }
  },
  
  delete: async (collectionPath: string, id: string) => {
    try {
      const docRef = doc(db, collectionPath, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${collectionPath}/${id}:`, error);
      throw error;
    }
  },
  
  list: async <T>(
    collectionPath: string, 
    constraints: QueryConstraint[] = [],
    lastVisible: any = null,
    itemsPerPage = 10
  ): Promise<{ items: (T & {
      title: string;
      description: string;
      resources: never[]; id: string 
})[], lastVisible: any }> => {
    try {
      let q = query(collection(db, collectionPath), ...constraints);
      
      if (lastVisible) {
        q = query(q, startAfter(lastVisible), limit(itemsPerPage));
      } else {
        q = query(q, limit(itemsPerPage));
      }
      
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }));
      
      return {
        items,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null
      };
    } catch (error) {
      console.error(`Error listing documents in ${collectionPath}:`, error);
      throw error;
    }
  },

  // Batch operations
  batch: () => {
    return writeBatch(db);
  },

  // Array operations
  arrayUnion: (item: any) => arrayUnion(item),
  arrayRemove: (item: any) => arrayRemove(item)
};

// Export common query builders
export const queryBuilders = {
  orderByCreatedAt: (direction: 'asc' | 'desc' = 'desc') => orderBy('createdAt', direction),
  whereField: (field: string, operator: '==' | '!=' | '>' | '>=' | '<' | '<=', value: any) => 
    where(field, operator, value),
  limitTo: (count: number) => limit(count)
};

export { Timestamp, serverTimestamp };