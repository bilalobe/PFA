import functions from 'firebase-functions';
import admin from 'firebase-admin';
import express from 'express';
const cors = require('cors')({ origin: true });
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

interface ErrorResponse {
  message: string;
  id?: string;
  title?: string;
  content?: string;
  statusCode?: number;
}

const handleError = (res: Response, error: ErrorResponse): void => {
  const statusCode = error.statusCode || 500;
  const { message, id, title, content } = error;
  res.status(statusCode).json({ message, id, title, content });
};

const authenticateToken = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    return next();
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return res.status(401).send({ error: 'Unauthorized' });
  }
};


app.post('/users', authenticateToken, async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName });
    const userDoc = db.collection('users').doc(userRecord.uid);
    await userDoc.set({ email, displayName });
    return res.status(201).json({ id: userRecord.uid, email, displayName });
  } catch (error) {
    return handleError(res, { message: (error as any).message });
  }
});

app.get('/users/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await admin.auth().getUser((req as any).user.uid);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
    res.status(200).json(userData);
  } catch (error) {
    return handleError(res, { message: (error as any).message });
  }
});

app.put('/users/me', authenticateToken, async (req: Request, res: Response) => {
  const { displayName, bio } = req.body;

  try {
    if (displayName) {
      await admin.auth().updateUser((req as any).user.uid, { displayName });
    }
    const userDoc = db.collection('users').doc((req as any).user.uid);
    if (bio) {
      await userDoc.set({ bio }, { merge: true });
    }
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return handleError(res, { message: (error as any).message });
  }
});

app.get('/courses', async (req: Request, res: Response) => {
  try {
    const coursesRef = db.collection('courses');
    const snapshot = await coursesRef.get();
    const courses = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(courses);
  } catch (error) {
    return handleError(res, { message: (error as any).message });
  }
});

app.get('/courses/:courseId', async (req: Request, res: Response) => {
  const { courseId } = req.params;
  try {
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (courseDoc.exists) {
      return res.status(200).json({ id: courseDoc.id, ...courseDoc.data() });
    } else {
      return res.status(404).json({ error: 'Course not found' });
    }
  } catch (error) {
    return handleError(res, { message: (error as any).message });
  }
});

app.post('/courses', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.uid) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const newCourse = {
      instructor: user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const newCourseRef = await db.collection('courses').add(newCourse);
    return res.status(201).json({ id: newCourseRef.id, ...newCourse });
  } catch (error) {
    if (error instanceof Error) {
      return handleError(res, { message: error.message });
    } else {
      return handleError(res, { message: 'An unknown error occurred.' });
    }
  }
});

app.put('/courses/:courseId', authenticateToken, async (req: Request, res: Response) => {
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

    if (courseDoc.data()?.instructor !== (req as any).user.uid) {
      return res.status(403).json({ error: 'Unauthorized. You are not the instructor of this course.' });
    }

    await courseRef.update(req.body);
    return res.status(200).send({ message: 'Course updated successfully.', id: courseId, ...req.body });
  } catch (error) {
    console.error("Error updating course:", error);
    return handleError(res, { message: (error as any).message });
  }
});

app.delete('/courses/:courseId', authenticateToken, async (req: Request, res: Response) => {
  const { courseId } = req.params;
  try {
    const courseRef = db.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }
    await courseRef.delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting course', error);
    return handleError(res, { message: (error as any).message });
  }
});

app.get('/courses/:courseId/modules', async (req: Request, res: Response) => {
  const { courseId } = req.params;
  try {
    const modulesSnapshot = await db.collection('courses').doc(courseId).collection('modules').get();
    const modules = modulesSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(modules);
  } catch (error) {
    return handleError(res, { message: (error as any).message });
  }
});

app.get('/courses/:courseId/modules/:moduleId', async (req: Request, res: Response) => {
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
    return handleError(res, { message: (error as any).message });
  }
});

app.post('/courses/:courseId/modules', authenticateToken, async (req: Request, res: Response) => {
  const { courseId } = req.params;
  try {
    const courseRef = db.collection('courses').doc(courseId);
    const courseSnapshot = await courseRef.get();
    if (!courseSnapshot.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const moduleData = {
      ...req.body,
      createdBy: (req as any).user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const newModuleRef = await courseRef.collection('modules').add(moduleData);
    return res.status(201).json({ id: newModuleRef.id, ...moduleData });
  } catch (error) {
    return handleError(res, { message: (error as any).message });
  }
});

app.put('/courses/:courseId/modules/:moduleId', authenticateToken, async (req: Request, res: Response) => {
  const { courseId, moduleId } = req.params;
  if (!Object.keys(req.body).length) {
    return res.status(400).send({ error: 'No data provided for update' });
  }

  try {
    const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
    const moduleSnapshot = await moduleRef.get();
    if (!moduleSnapshot.exists) {
      return res.status(404).json({ error: 'Module not found' });
    }
    await moduleRef.update(req.body);
    return res.status(200).send({ message: 'Module updated successfully', id: moduleId, ...req.body });
  } catch (error) {
    console.error('Error updating module:', error);
    return handleError(res, { message: (error as any).message });
  }
});

app.delete('/courses/:courseId/modules/:moduleId', authenticateToken, async (req: Request, res: Response) => {
  const { courseId, moduleId } = req.params;
  try {
    const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
    const moduleSnapshot = await moduleRef.get();
    if (!moduleSnapshot.exists) {
      return res.status(404).json({ error: 'Module not found' });
    }
    await moduleRef.delete();
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting module:', error);
    return handleError(res, { message: (error as any).message });
  }
});

exports.api = functions.https.onRequest(app);
