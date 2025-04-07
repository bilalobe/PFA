import { create } from 'zustand';
import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collectionGroup 
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface ForumState {
  forums: any[];
  currentForum: any | null;
  threads: any[];
  currentThread: any | null;
  posts: any[];
  comments: Record<string, any[]>;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchForums: (courseId: string) => Promise<void>;
  fetchForum: (courseId: string, forumId: string) => Promise<void>;
  fetchThreads: (courseId: string, forumId: string) => Promise<void>;
  fetchThread: (courseId: string, forumId: string, threadId: string) => Promise<void>;
  fetchPosts: (courseId: string, forumId: string, threadId: string) => Promise<void>;
  fetchComments: (courseId: string, forumId: string, threadId: string, postId: string) => Promise<void>;
  createForum: (courseId: string, forum: any) => Promise<string>;
  createThread: (courseId: string, forumId: string, thread: any) => Promise<string>;
  createPost: (courseId: string, forumId: string, threadId: string, post: any) => Promise<string>;
  createComment: (courseId: string, forumId: string, threadId: string, postId: string, comment: any) => Promise<string>;
  reportContent: (contentType: 'thread' | 'post' | 'comment', contentId: string, reason: string) => Promise<void>;
  clearForumState: () => void;
  setError: (error: string | null) => void;
}

export const forumStore = create<ForumState>((set, get) => ({
  forums: [],
  currentForum: null,
  threads: [],
  currentThread: null,
  posts: [],
  comments: {},
  loading: false,
  error: null,
  
  fetchForums: async (courseId: string) => {
    set({ loading: true, error: null });
    try {
      const forumsQuery = query(
        collection(db, `courses/${courseId}/forums`),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(forumsQuery);
      const forums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ forums, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchForum: async (courseId: string, forumId: string) => {
    set({ loading: true, error: null });
    try {
      const forumDoc = await getDoc(doc(db, `courses/${courseId}/forums`, forumId));
      if (forumDoc.exists()) {
        set({ currentForum: { id: forumDoc.id, ...forumDoc.data() }, loading: false });
      } else {
        set({ error: 'Forum not found', loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchThreads: async (courseId: string, forumId: string) => {
    set({ loading: true, error: null });
    try {
      const threadsQuery = query(
        collection(db, `courses/${courseId}/forums/${forumId}/threads`),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(threadsQuery);
      const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ threads, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchThread: async (courseId: string, forumId: string, threadId: string) => {
    set({ loading: true, error: null });
    try {
      const threadDoc = await getDoc(doc(db, `courses/${courseId}/forums/${forumId}/threads`, threadId));
      if (threadDoc.exists()) {
        set({ currentThread: { id: threadDoc.id, ...threadDoc.data() }, loading: false });
      } else {
        set({ error: 'Thread not found', loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchPosts: async (courseId: string, forumId: string, threadId: string) => {
    set({ loading: true, error: null });
    try {
      const postsQuery = query(
        collection(db, `courses/${courseId}/forums/${forumId}/threads/${threadId}/posts`),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(postsQuery);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ posts, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchComments: async (courseId: string, forumId: string, threadId: string, postId: string) => {
    set({ loading: true, error: null });
    try {
      const commentsQuery = query(
        collection(db, `courses/${courseId}/forums/${forumId}/threads/${threadId}/posts/${postId}/comments`),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(commentsQuery);
      const newComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      set(state => ({
        comments: {
          ...state.comments,
          [postId]: newComments
        },
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  createForum: async (courseId: string, forum) => {
    set({ loading: true, error: null });
    try {
      const forumData = {
        ...forum,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, `courses/${courseId}/forums`), forumData);
      set(state => ({ 
        forums: [{ id: docRef.id, ...forumData }, ...state.forums],
        loading: false 
      }));
      return docRef.id;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return '';
    }
  },
  
  createThread: async (courseId: string, forumId: string, thread) => {
    set({ loading: true, error: null });
    try {
      const threadData = {
        ...thread,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, `courses/${courseId}/forums/${forumId}/threads`), threadData);
      set(state => ({ 
        threads: [{ id: docRef.id, ...threadData }, ...state.threads],
        loading: false 
      }));
      return docRef.id;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return '';
    }
  },
  
  createPost: async (courseId: string, forumId: string, threadId: string, post) => {
    set({ loading: true, error: null });
    try {
      const postData = {
        ...post,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(
        collection(db, `courses/${courseId}/forums/${forumId}/threads/${threadId}/posts`), 
        postData
      );
      set(state => ({ 
        posts: [...state.posts, { id: docRef.id, ...postData }],
        loading: false 
      }));
      return docRef.id;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return '';
    }
  },
  
  createComment: async (courseId: string, forumId: string, threadId: string, postId: string, comment) => {
    set({ loading: true, error: null });
    try {
      const commentData = {
        ...comment,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(
        collection(db, `courses/${courseId}/forums/${forumId}/threads/${threadId}/posts/${postId}/comments`), 
        commentData
      );
      
      const newComment = { id: docRef.id, ...commentData };
      
      set(state => ({
        comments: {
          ...state.comments,
          [postId]: [...(state.comments[postId] || []), newComment]
        },
        loading: false
      }));
      return docRef.id;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return '';
    }
  },
  
  reportContent: async (contentType, contentId, reason) => {
    set({ loading: true, error: null });
    try {
      await addDoc(collection(db, 'reports'), {
        contentType,
        contentId,
        reason,
        status: 'pending',
        reportedAt: serverTimestamp(),
        reportedBy: 'current-user-id' // This should be the actual user ID
      });
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  clearForumState: () => {
    set({
      currentForum: null,
      threads: [],
      currentThread: null,
      posts: [],
      comments: {},
      error: null
    });
  },
  
  setError: (error) => {
    set({ error });
  }
}));