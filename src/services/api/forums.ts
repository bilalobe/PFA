import { 
  collection, addDoc, getDocs, query, 
  where, orderBy, limit, startAfter,
  doc, getDoc, updateDoc, Timestamp,
  serverTimestamp, QueryDocumentSnapshot
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../../firebaseConfig";
import { handleApiError } from "../utils/errorHandling";
import { 
  ForumData, PostData, CreatePostResponse, 
  Comment, ForumPost 
} from "../../interfaces/types";

export const forumApi = {
  // Fetch Forums for a Course
  async fetchForumsForCourse(courseId: string): Promise<ForumData[]> {
    try {
      const forumsRef = collection(db, 'courses', courseId, 'forums'); 
      const snapshot = await getDocs(forumsRef);
      const forums = snapshot.docs.map((doc) => ({ 
        id: doc.id, ...doc.data() 
      } as ForumData));
      return forums;
    } catch (error) {
      handleApiError(error, `Failed to fetch forums for course ${courseId}.`);
      return [];
    }
  },

  // Create a Forum (usually for teachers/admins)
  createForum: async (courseId: string, forumData: any) => {
    try {
      const user = auth.currentUser; 
      if (!user) {
        throw new Error("User not authenticated."); 
      }

      // Create a new forum in Firestore under the course 
      const forumsRef = collection(db, 'courses', courseId, 'forums');
      const newForum = { 
          ...forumData, 
          createdAt: Timestamp.now(),
          createdBy: user.uid, 
          threadCount: 0 // Initialize the thread count 
      };
      const docRef = await addDoc(forumsRef, newForum);
      return { id: docRef.id, ...newForum };
    } catch (error) {
      handleApiError(error, `Failed to create forum for course ${courseId}.`);
    }
  },

  // Create a New Thread 
  createThread: async (forumId: string, threadData: any) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated.'); 
      }
      const threadsRef = collection(db, 'forums', forumId, 'threads'); 
      const docRef = await addDoc(threadsRef, {
        ...threadData, 
        createdBy: user.uid,
        createdAt: Timestamp.now(), 
        postCount: 0 
      }); 
      return { id: docRef.id, ...threadData }; 
    } catch (error) {
      handleApiError(error, `Failed to create thread in forum ${forumId}.`);
    }
  },

  // Fetch Posts for a Thread 
  fetchPostsForThread: async (forumId: string, threadId: string, lastVisible?: any, limitValue: number = 10): Promise<{ posts: any[], lastVisible?: any }> => {
    try {
      let q;
      if (lastVisible) {
        q = query(
          collection(db, 'forums', forumId, 'threads', threadId, 'posts'),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(limitValue)
        );
      } else {
        q = query(
          collection(db, 'forums', forumId, 'threads', threadId, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(limitValue)
        );
      }

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return { posts, lastVisible: snapshot.docs[snapshot.docs.length - 1] };

    } catch (error) {
      handleApiError(error, `Failed to fetch posts for thread ${threadId}.`);
      return { posts: [] };
    }
  },
  
  // Create a New Post
  createPost: async (forumId: string, threadId: string, postData: PostData): Promise<CreatePostResponse | void> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      // Add timestamp
      const timestamp = Timestamp.now();

      // Optionally perform sentiment analysis
      let sentiment = null;
      try {
        const analyzeSentiment = httpsCallable(functions, 'analyzeSentiment');
        const response = await analyzeSentiment({ text: postData.content });
        if (response.data && typeof response.data === 'object' && 'sentiment' in response.data) {
          sentiment = response.data.sentiment;
        }
      } catch (sentimentError) {
        console.error('Sentiment analysis failed:', sentimentError);
      }

      const postsRef = collection(db, 'forums', forumId, 'threads', threadId, 'posts');
      const docRef = await addDoc(postsRef, {
        ...postData,
        author: user.uid,
        createdAt: timestamp,
        sentiment: sentiment // Add sentiment if available
      });

      // Award forum points to the user
      try {
        const awardPoints = httpsCallable(functions, 'awardPoints');
        await awardPoints({ userId: user.uid, points: 10 }); // Adjust points as necessary
      } catch (pointsError) {
        console.error('Awarding points failed:', pointsError);
      }

      // Increment the post count on the thread
      await updateDoc(doc(db, 'forums', forumId, 'threads', threadId), {
        postCount: increment(1)
      });

      return { id: docRef.id, ...postData };

    } catch (error) {
      handleApiError(error, `Failed to create post in thread ${threadId}.`);
    }
  },

  // Fetch Comments for a Post
  fetchComments: async (postId: string, lastVisible?: QueryDocumentSnapshot, limitValue: number = 10): Promise<{ comments: Comment[], lastVisible?: QueryDocumentSnapshot } | null> => {
    try {
        const commentsCollection = collection(db, 'posts', postId, 'comments');
        const baseQuery = query(commentsCollection, orderBy('createdAt', 'desc'), limit(limitValue));
        
        const q = lastVisible ? query(baseQuery, startAfter(lastVisible)) : baseQuery;

        const snapshot = await getDocs(q);
        const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Comment));

        return { comments, lastVisible: snapshot.docs[snapshot.docs.length - 1] };
    } catch (error) {
        handleApiError(error, `Failed to fetch comments for post ${postId}.`);
        return null;
    }
  },

  // Create a Comment
  createComment: async (postId: string, commentData: any) => {
    try {
      const user = auth.currentUser; 
      if (!user) {
        throw new Error("User not authenticated."); 
      }
      // Add timestamp and author 
      const timestamp = Timestamp.now();
      commentData.author = user.uid;
      commentData.createdAt = timestamp;

      // Store the comment as a subcollection of the post
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const docRef = await addDoc(commentsRef, commentData);
      return { id: docRef.id, ...commentData, author: user.uid, createdAt: timestamp }; 
    } catch (error) {
      handleApiError(error, `Failed to create comment on post ${postId}.`);
    }
  },

  // Report a Post (Moderation) 
  reportPost: async (postId: string, reason: string): Promise<{ id: string, postId: string, reason: string, reportedBy: string, reportedAt: Timestamp, status: string } | null> => {
    try {
      const user = auth.currentUser;
      if (!user) {
          throw new Error("User not authenticated.");
      }

      // Check for existing reports (optional)
      const existingReportsQuery = query(
          collection(db, 'moderation'),
          where('postId', '==', postId),
          where('reportedBy', '==', user.uid)
      );
      const existingReportsSnapshot = await getDocs(existingReportsQuery);
      if (!existingReportsSnapshot.empty) {
          throw new Error("You have already reported this post.");
      }

      const reportsRef = collection(db, 'moderation');
      const reportData = {
          postId,
          reason,
          reportedBy: user.uid,
          reportedAt: Timestamp.now(),
          status: 'pending' // Add a status field (optional)
      };
      const docRef = await addDoc(reportsRef, reportData);
      return { id: docRef.id, ...reportData };
    } catch (error) {
      handleApiError(error, `Failed to report post ${postId}.`);
      return null;
    }
  }
};

// Helper function to increment a value (similar to FieldValue.increment in the Firebase admin SDK)
function increment(value: number) {
  return {
    __op: "increment",
    value,
  };
}

export default forumApi;