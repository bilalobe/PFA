import { 
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  getDoc, 
  serverTimestamp, 
  orderBy, 
  limit,
  QueryDocumentSnapshot,
} from "firebase/firestore";

import 'firebase/storage';
import { deleteObject, getDownloadURL, ref, StorageReference,  } from "firebase/storage";

import { auth, db, functions, storage } from "../firebaseConfig";
import { UserProfile, QuizAttemptData, CourseData, QuizData, AnswerData, ModuleData, QuestionData, Resource, ForumData, PostData, CreatePostResponse } from "../interfaces/types";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firestore } from "firebase-admin";


// --- Error Handling --- 

interface ApiError extends Error {
  response?: {
    status: number;
    data: {
      detail?: string;
    };
  };
  request?: any;
}

const handleApiError = (error: unknown, defaultMessage: string): never => {
  console.error(error);

  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;

    if (apiError.response) {
      const { status, data } = apiError.response;
      const message = data.detail || defaultMessage;

      switch (status) {
        case 400:
          throw new Error(message || 'Bad Request: Please check your input.');
        case 401:
          throw new Error('Unauthorized: Please log in again.');
        case 403:
          throw new Error('Forbidden: You do not have permission.');
        case 404:
          throw new Error(message || 'Not Found: The requested resource was not found.');
        case 500:
          throw new Error(message || 'Internal Server Error: Please try again later.');
        default:
          throw new Error(message || 'An unexpected error occurred.');
      }
    } else if (apiError.request) {
      throw new Error('No response received from server.');
    }
  }

  throw new Error(defaultMessage || 'An unknown error occurred.');
};

// === Authentication API (Firebase) === 

export const authApi = {
  logout: async () => {
    try {
      await auth.signOut();
    } catch (error) {
      handleApiError(error as ApiError, 'Logout failed.');
    }
  }
};


export const userApi = {
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserProfile;
        return { id: user.uid, user_type: '', ...userData };
      } else {
        throw new Error("User profile not found.");
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch user profile.');
    }
    return null;
  },

  updateProfile: async (updatedProfileData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      await updateDoc(doc(db, 'users', user.uid), updatedProfileData);

      return await userApi.getProfile();
    } catch (error) {
      handleApiError(error, 'Failed to update profile.');
    }
    return null;
  },
};

// === Course API (Firestore) === 


export const courseApi = {
  fetchCourses: async (): Promise<CourseData[] | null> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      handleApiError(error, 'Failed to fetch courses.');
    }
    return null;
  },

  fetchCourseDetails: async (courseId: string): Promise<CourseData | null> => {
    try {
      const docRef = doc(db, 'courses', courseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        throw new Error('Course not found.');
      }
    } catch (error) {
      handleApiError(error, `Failed to fetch details for course ${courseId}.`);
    }
    return null;
  },

  createCourse: async (courseData: CourseData): Promise<CourseData | null> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const docRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        instructor: user.uid,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...courseData };
    } catch (error) {
      handleApiError(error, 'Failed to create the course.');
    }
    return null;
  },

  updateCourse: async (courseId: string, updatedData: CourseData): Promise<CourseData | null> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);

      if (!courseSnap.exists()) {
        throw new Error('Course not found.');
      }

      if (courseSnap.data().instructor !== user.uid) {
        throw new Error("You are not authorized to update this course.");
      }

      await updateDoc(courseRef, updatedData);
      return { id: courseId, ...updatedData };
    } catch (error) {
      handleApiError(error, 'Failed to update the course.');
    }
    return null;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);

      if (!courseSnap.exists()) {
        throw new Error('Course not found.');
      }

      if (courseSnap.data().instructor !== user.uid) {
        throw new Error("You do not have permission to delete this course.");
      }

      await deleteDoc(courseRef);
    } catch (error) {
      handleApiError(error, 'Failed to delete the course.');
    }
  }
};


// === Quiz API (Firestore) ===

// @ts-ignore

export const quizApi = { 
  fetchQuizzesForCourse: async (courseId: string): Promise<QuizData[] | null> => {
    try {
      const q = query(collection(db, 'courses', courseId, 'quizzes'));
      const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          user: data.user,
          score: data.score,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          // Add other properties if necessary
        } as QuizAttemptData;
      });  } catch (error) {
      handleApiError(error, `Failed to fetch quizzes for course ${courseId}.`);
    }
    return null;
  },

  fetchQuiz: async (quizId: string): Promise<QuizData | null> => {
    try {
      const quizDocRef = doc(db, 'quizzes', quizId);
      const quizDocSnap = await getDoc(quizDocRef);

      if (quizDocSnap.exists()) {
        return { ...quizDocSnap.data(), id: quizDocSnap.id };
      } else {
        throw new Error('Quiz not found');
      }
    } catch (error) {
      handleApiError(error, `Failed to fetch quiz ${quizId}`);
    }
    return null;
  },

  fetchQuizQuestions: async (quizId: string): Promise<QuizData[] | null> => {
    try {
      const questionsRef = collection(db, 'quizzes', quizId, 'questions');
      const snapshot = await getDocs(questionsRef);
      const questions: QuizData[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Optionally, you could sort questions here by their order field if you have one
      // Example using sort from firebase/firestore:
      questions.sort((a, b) => a.order - b.order);
      return questions;
    } catch (error) {
      handleApiError(error, `Failed to fetch questions for quiz ${quizId}`);
    }
    return null;
  },

  submitQuizAttempt: async (quizId: string, answers: any): Promise<QuizAttemptData | null> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }
  
      const attemptsRef = collection(db, 'quizzes', quizId, 'attempts');
  
      // You need to calculate the score here.
      const score: number = calculateQuizScore(answers); // Ensure the score is of type 'number'
  
      const attemptData: QuizAttemptData = {
        user: user.uid,
        score,
        startedAt: Timestamp.now(),
        completedAt: Timestamp.now(),
        // ... (other data, like selected answers, if needed)
      };
      const newAttemptRef = await addDoc(attemptsRef, attemptData);
  
      return { id: newAttemptRef.id, ...attemptData };
    } catch (error) {
      handleApiError(error, `Failed to submit quiz attempt for quiz ${quizId}`);
    }
    return null;
  },
  fetchQuizAttempts: async (quizId: string): Promise<QuizAttemptData[] | null> => {
    try {
      const q = query(collection(db, 'quizzes', quizId, 'attempts'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        user: doc.data().user,
        score: doc.data().score,
        startedAt: doc.data().startedAt,
        completedAt: doc.data().completedAt,
      }));
    } catch (error) {
      handleApiError(error, `Failed to fetch quiz attempts for quiz ${quizId}`);
    }
    return null;
  }
};


// === Enrollment API (Firestore) === 

export const moduleApi = {
  fetchModules: async (courseId: string): Promise<ModuleData[] | null> => {
    try {
      const modulesRef = collection(db, 'courses', courseId, 'modules');
      const snapshot = await getDocs(modulesRef);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      handleApiError(error, `Failed to fetch modules for course ${courseId}.`);
    }
    return null;
  },
};
// @ts-ignore

export const quizApi = { 
  fetchQuizzesForCourse: async (courseId: string): Promise<QuizData[] | null> => {
    try {
      const q = query(collection(db, 'courses', courseId, 'quizzes'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleApiError(error, `Failed to fetch quizzes for course ${courseId}.`);
    }
    return null;
  },

  fetchQuiz: async (quizId: string): Promise<QuizData | null> => {
    try {
      const quizDocRef = doc(db, 'quizzes', quizId);
      const quizDocSnap = await getDoc(quizDocRef);

      if (quizDocSnap.exists()) {
        return { ...quizDocSnap.data(), id: quizDocSnap.id };
      } else {
        throw new Error('Quiz not found');
      }
    } catch (error) {
      handleApiError(error, `Failed to fetch quiz ${quizId}`);
    }
    return null;
  },

  fetchQuizQuestions: async (quizId: string): Promise<QuestionData[] | null> => {
    try {
      const questionsRef = collection(db, 'quizzes', quizId, 'questions');
      const snapshot = await getDocs(questionsRef);
      const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return questions;
    } catch (error) {
      handleApiError(error, `Failed to fetch questions for quiz ${quizId}.`);
    }
    return null;
  },

  submitQuizAttempt: async (quizId: string, answers: AnswerData): Promise<QuizAttemptData | null> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const attemptsRef = collection(db, 'quizzes', quizId, 'attempts');

      // You need to calculate the score here.
      const score = calculateQuizScore(answers);

      const attemptData: QuizAttemptData = {
        user: user.uid,
        score,
        startedAt: Timestamp.now(),
        completedAt: Timestamp.now(),
      };
      const newAttemptRef = await addDoc(attemptsRef, attemptData);

      return { id: newAttemptRef.id, ...attemptData };
    } catch (error) {
      handleApiError(error, `Failed to submit quiz attempt for quiz ${quizId}.`);
    }
    return null;
  },
};


// === Forum API (Firestore)  ===


export const forumApi = {
  // 1. Fetch Forums for a Course
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

  // 2. Create a Forum (usually for teachers/admins)
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

  // 4. Create a New Thread 
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

  // 5.  Fetch Posts for a Thread 
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
  

  // 6.  Create a New Post
 createPost : async (forumId: string, threadId: string, postData: PostData): Promise<CreatePostResponse | void> => {
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
      const functions = getFunctions();
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
      postCount: firestore.FieldValue.increment(1)
    });

    return { id: docRef.id, ...postData };

  } catch (error) {
    console.error(`Failed to create post in thread ${threadId}:`, error);
  }
},

  // 7. Fetch Comments for a Post (Use Subcollections)
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

  // 8. Create a Comment (use subcollections)
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

  // 9. Report a Post  (Moderation) 
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

// === Resource API (Firestore + Firebase Storage) ===

export const resourceApi = {
  fetchResourcesForModule: async (moduleId: string) => {
    try {
        const q = query(collection(db, 'resources'), where('moduleId', '==', moduleId));
        const snapshot = await getDocs(q);
        const resources = snapshot.docs.map(async (doc) => {
            const resourceData = doc.data();

            const storageRef = ref(storage, resourceData.filePath);
            const downloadUrl = await getDownloadURL(storageRef);

            return {
                id: doc.id,
                ...resourceData,
                downloadUrl // Add the download URL to the resource object
            };
        });

        return await Promise.all(resources);
    } catch (error) {
        handleApiError(error, `Failed to fetch resources for module ${moduleId}.`);
        return []; // Return an empty array in case of an error
    }
},

  uploadResource: async (moduleId: string, file: File, onUploadProgress?: (progress: number) => void): Promise<{ id: string, title: string, description: string, moduleId: string, uploadedBy: string, uploadDate: Date, fileType: string, filePath: string, downloadUrl: string } | null> => {
    try {
      const user = auth.currentUser; 
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const storageRef = ref(storage, `resources/${user.uid}/${moduleId}/${file.name}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => { // @ts-ignore

        uploadTask.on('state_changed', 
          (snapshot: any) => {
            if (onUploadProgress) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onUploadProgress(progress);
            }
          }, 
          (error: any) => reject(error), 
          async () => {
            try { // @ts-ignore

              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref); 
              resolve({
                id: storageRef.fullPath,
                title: file.name,
                description: "",
                moduleId,
                uploadedBy: user.uid,
                uploadDate: new Date(),
                fileType: file.type,
                filePath: storageRef.fullPath,
                downloadUrl
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error("Failed to upload resource:", error);
      return null;
    }
  },

  // Update a resource 
  updateResource: async (resourceId: string, updates: Partial<Resource>) => {
    try {
      // ... add authorization logic to make sure only the resource owner (the uploader)
      // or an admin can update a resource ...

      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, updates); 
    } catch (error) {
      handleApiError(error, `Failed to update resource ${resourceId}.`);
    }
  },

  // Delete a resource
  deleteResource: async (resourceId: string) => {
    try {
      // ... add authorization logic ...
      const resourceRef = doc(db, 'resources', resourceId);

      // 1. Get the resource data to find the file path 
      const resourceSnapshot = await getDoc(resourceRef);
      const resourceData = resourceSnapshot.data();

      // 2. Delete the file from Firebase Storage
      if (resourceData && resourceData.filePath) {
        const storageRef = ref(storage, resourceData.filePath);
        await deleteObject(storageRef);
      }

      // 3. Delete the resource document from Firestore 
      await deleteDoc(resourceRef); 

    } catch (error) {
      handleApiError(error, `Failed to delete resource ${resourceId}.`);
    }
  },

  // Increment the resource's download count 
  incrementDownloadCount: async (resourceId: string) => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        downloadCount:  firestore.FieldValue.increment(1)
      });
    } catch (error) {
      // Consider handling errors silently here, 
      // as download counts aren't always critical
      console.error("Error incrementing download count:", error);
    }
  }
};

// === Gamification API (Firestore) ===

export const gamificationApi = {
  // Award points to a user
  awardPoints: async (userId: string, points: number) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        points:  firestore.FieldValue.increment(points)
      });
    } catch (error) {
      handleApiError(error, `Failed to award points to user ${userId}.`);
    }
  },

  // Deduct points from a user
  deductPoints: async (userId: string, points: number) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        points:  firestore.FieldValue.increment(-points)
      });
    } catch (error) {
      handleApiError(error, `Failed to deduct points from user ${userId}.`);
    }
  }
};

// === Helper Functions ===

function startAfter(lastVisible: any): import("@firebase/firestore").QueryConstraint {
  throw new Error("Function not implemented.");
}
function calculateQuizScore(answers: any): number {
  let score = 0;
  for (const answer of answers) {
    if (answer.isCorrect) {
      score++;
    }
  }
  return score;
}

function uploadBytesResumable(storageRef: StorageReference, file: File) {
  throw new Error("Function not implemented.");
}


// === AI API (Firestore) ===


export const getSentiment = async (text: string) => {
  try {
    const functions = getFunctions();
    const analyzeSentiment = httpsCallable(functions, 'analyzeSentiment');
    const response = await analyzeSentiment({ text });

    if (response.data && typeof response.data === 'object' && 'sentiment' in response.data) {
      return { sentiment: response.data.sentiment };
    } else {
      throw new Error('Invalid response from Genkit AI');
    }
  } catch (error) {
    handleApiError(error, 'Failed to analyze sentiment.');
    return { sentiment: null, error: 'Failed to analyze sentiment.' };
  }
};