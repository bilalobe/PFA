const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors')({ origin: true }); 
import path from 'path';
import Busboy from 'busboy';
//  Add import for your sentiment analysis library/API
// ...

// --- Firebase Initialization ---
admin.initializeApp();
const db = admin.firestore(); 
const storage = admin.storage().bucket();

// --- Express.js App Setup --- 
const app = express();
app.use(cors());
app.use(express.json());

// --- Helper Functions (utils.js) ---
// (Include your `handleError` and any other helpers in `functions/utils.js`) 

// --- Authentication Middleware ---
const authenticateToken = async (req: { headers: { authorization: any; }; user: any; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { error: string; }): any; new(): any; }; }; }, next: () => void) => { 
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ error: 'Unauthorized' }); 
    }
  
    const idToken = authHeader.split('Bearer ')[1];
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken; 
      next(); 
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return res.status(401).send({ error: 'Unauthorized' });
    }
};

// === API Modules (Consistent Structure) ===

// --- USER API ---
app.post('/users', authenticateToken, async (req: any, res: any) => { 
    // Validate data (e.g., ensure required fields are present, validate email format, etc.)
    // Create a new user document in your Firestore "users" collection
    // You can add a subcollection "privateData" if you need to store sensitive data or information not accessible to all users
});

app.get('/users/me', authenticateToken, async (req: { user: { uid: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { uid: any; email: any; displayName: any; }): void; new(): any; }; }; }) => {
  try {
    const user = await admin.auth().getUser(req.user.uid);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      // Add other user data from Auth or Firestore if needed
    }; 
    res.status(200).json(userData); 
  } catch (error) {
    handleError(res, error); 
  }
});

app.put('/users/me', authenticateToken, async (req: { body: { displayName: any; photoURL: any; phoneNumber: any; bio: any; }; user: { uid: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; }) => {
  // Validate the input data to prevent issues
  const { displayName, photoURL, phoneNumber, bio } = req.body; 

  try {
    if (displayName) {
      await admin.auth().updateUser(req.user.uid, { displayName }); 
    }
    const userDoc = db.collection('users').doc(req.user.uid);
    await userDoc.set({ bio }, { merge: true });
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error); 
    handleError(res, error);  
  }
});

// --- COURSE API ---
app.get('/courses', async (req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): any; new(): any; }; }; }) => {
  try {
    const coursesRef = db.collection('courses'); 
    const snapshot = await coursesRef.get(); 
    const courses = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(courses);
  } catch (error) {
    return handleError(res, error);
  }
});

app.get('/courses/:courseId', async (req: { params: { courseId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): any; new(): any; }; }; }) => {
  const { courseId } = req.params; 
  try {
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (courseDoc.exists) {
      return res.status(200).json({ id: courseDoc.id, ...courseDoc.data() });
    } else {
      return res.status(404).json({ error: 'Course not found' }); 
    }
  } catch (error) {
    return handleError(res, error); 
  }
});

app.post('/courses', authenticateToken, async (req: { user: { uid: any; }; }, res: {
    status: (arg0: number) => {
      (): any; new(): any; json: {
        (arg0: {
          instructor: any; createdAt: any; modules: never[]; // Initialize modules as an empty array
          id: any;
        }): any; new(): any;
      };
    };
  }) => {
  try {
    const newCourse = { 
      instructor: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      modules: []  // Initialize modules as an empty array
    };

    const newCourseRef = await db.collection('courses').add(newCourse); 
    return res.status(201).json({ id: newCourseRef.id, ...newCourse }); 
  } catch (error) {
    return handleError(res, error);
  }
}); 

app.put('/courses/:courseId', authenticateToken, async (req: { params: { courseId: any; }; body: {}; user: { uid: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { error: string; }): any; new(): any; }; json: { (arg0: { error: string; }): any; new(): any; }; }; }) => {
  const { courseId } = req.params;

  if (!Object.keys(req.body).length) {
    return res.status(400).send({ error: 'No data provided for update' });
  }

  try {
    const courseRef = db.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (courseDoc.data().instructor !== req.user.uid) { 
      return res.status(403).json({ error: 'Unauthorized. You are not the instructor of this course.' }); 
    }

    await courseRef.update(req.body); 
    return res.status(200).send({ message: 'Course updated successfully.', id: courseId, ...req.body });
  } catch (error) {
    console.error("Error updating course:", error); 
    handleError(res, error);
  }
});

app.delete('/courses/:courseId', authenticateToken, async (req: { params: { courseId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): any; new(): any; }; send: { (): void; new(): any; }; }; }) => {
  const { courseId } = req.params;

  try {
    const courseRef = db.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get(); 

    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Add your authorization logic if needed

    await courseRef.delete();
    res.status(204).send(); 
  } catch (error) {
    console.error('Error deleting course', error); 
    handleError(res, error);
  }
});

// --- MODULE API ---
app.get('/courses/:courseId/modules', async (req: { params: { courseId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): void; new(): any; }; }; }) => {
  const { courseId } = req.params;
  try {
    const modulesSnapshot = await db.collection('courses').doc(courseId).collection('modules').get();
    const modules = modulesSnapshot.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(modules);
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/courses/:courseId/modules/:moduleId', async (req: { params: { courseId: any; moduleId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): any; new(): any; }; }; }) => {
  const { courseId, moduleId } = req.params;

  try {
    const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
    const moduleSnapshot = await moduleRef.get();

    if (moduleSnapshot.exists) {
      const moduleData = { id: moduleSnapshot.id, ...moduleSnapshot.data() };
      return res.status(200).json(moduleData);
    } else {
      return res.status(404).json({ error: 'Module not found' });
    }
  } catch (error) {
    return handleError(res, error);
  }
});

app.post('/courses/:courseId/modules', authenticateToken, async (req: { params: { courseId: any; }; body: any; user: { uid: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): any; new(): any; }; }; }) => {
  const { courseId } = req.params;

  try {
    const courseRef = db.collection('courses').doc(courseId);
    const courseSnapshot = await courseRef.get();

    if (!courseSnapshot.exists) {
      return res.status(404).json({ error: 'Course not found' }); 
    }

    const moduleData = {
      ...req.body,
      createdBy: req.user.uid, 
      createdAt: admin.firestore.FieldValue.serverTimestamp() 
    };

    const newModuleRef = await courseRef.collection('modules').add(moduleData);
    return res.status(201).json({ 
      id: newModuleRef.id, 
      ...moduleData 
    }); 

  } catch (error) {
    return handleError(res, error); 
  }
}); 

app.put('/courses/:courseId/modules/:moduleId', authenticateToken, async (req: { params: { courseId: any; moduleId: any; }; body: {}; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { error: string; }): any; new(): any; }; json: { (arg0: { error: string; }): any; new(): any; }; }; }) => {
  const { courseId, moduleId } = req.params;

  if (!Object.keys(req.body).length) {
    return res.status(400).send({ error: 'No data provided for update' });
  }

  try {
    const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
    const moduleSnapshot = await moduleRef.get();

    if (moduleSnapshot.exists) {
      await moduleRef.update(req.body); 
      return res.status(200).json({ message: 'Module updated successfully', id: moduleId, ...req.body }); 
    } else {
      return res.status(404).json({ error: 'Module not found' }); 
    }
  } catch (error) {
    console.error('Error updating module:', error); 
    handleError(res, error); 
  }
}); 

app.delete('/courses/:courseId/modules/:moduleId', authenticateToken, async (req: { params: { courseId: any; moduleId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (): void; new(): any; }; }; }) => {
  const { courseId, moduleId } = req.params;

  try {
    const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
    await moduleRef.delete();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting module:", error); 
    handleError(res, error); 
  }
});

// --- QUIZ API ---
// Implement similar structure as the course API for quizzes

// --- ENROLLMENT API ---
app.get('/enrollments', authenticateToken, async (req: { user: { uid: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): void; new(): any; }; }; }) => {
  try {
    const enrollments = await db.collection('enrollments')
      .where('student', '==', req.user.uid) 
      .get();
    const enrollmentData = enrollments.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(enrollmentData);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/enrollments', authenticateToken, async (req: { body: { courseId: any; }; }, res: any) => {
  const { courseId } = req.body;

  if (!courseId) {
    return handleError(res, createErrorMessage(ERROR_TYPES.validation, 'Course ID is required'), 400);
  }

  try {
    // Logic to enroll the authenticated user into the course using `courseId`
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/enrollments/:enrollmentId', authenticateToken, async (req: any, res: any) => {
  // ...
});

app.delete('/enrollments/:enrollmentId', authenticateToken, async (req: any, res: any) => {
  // ...
});

// --- RESOURCE API --- 
// Implement the API routes for your resources

// --- FORUM API --- 
// Implement forum-related endpoints (creating new posts, threads, etc.)

// --- CHAT API ---
// Implement API endpoints for chat functionality

// --- Export API ---
exports.api = functions.https.onRequest(app);

function handleError(res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): any; new(): any; }; }; }, error: unknown) {
  throw new Error('Function not implemented.');
}

function createErrorMessage(validation: any, arg1: string): unknown {
  throw new Error('Function not implemented.');
}
// Export other functions if needed, for example, exports.dailyCleanupTask
