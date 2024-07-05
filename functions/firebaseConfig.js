import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";
import { getPerformance } from "firebase/performance";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});

// Initialize the Vertex AI service
const vertexAI = getVertexAI(app);

// Initialize the generative model with a model that supports your use case
// Gemini 1.5 Pro is versatile and can accept both text-only or multimodal prompt inputs
getGenerativeModel(vertexAI, { model: "gemini-1.5-pro-preview-0409" });

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);
const analytics = getAnalytics(app);
const functions = getFunctions(app);
const messaging = getMessaging(app);
const performance = getPerformance(app);

export { analytics, app, appCheck, auth, database, db, functions, messaging, performance, storage };