import { getAnalytics, Analytics } from "firebase/analytics";
import { initializeApp, FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from "firebase/app-check";
import { PredictionServiceClient }from "@google-cloud/aiplatform";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";
import { getFirestore, Firestore } from "firebase/firestore";
import { getFunctions, Functions } from "firebase/functions";
import { getMessaging, Messaging } from "firebase/messaging";
import { getPerformance } from "firebase/performance";
import { getStorage } from "firebase/storage";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app: FirebaseApp = initializeApp(firebaseConfig);

const appCheck: AppCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("RECAPTCHA_SITE_KEY"),
  isTokenAutoRefreshEnabled: true
});


// Initialize the Vertex AI client
const vertexAIClient = new PredictionServiceClient({
  credentials: {
    client_email: process.env.VERTEX_AI_CLIENT_EMAIL,
    private_key: process.env.VERTEX_AI_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  projectId: process.env.VERTEX_AI_PROJECT_ID
});

// Initialize Firebase services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage = getStorage(app);
const database: Database = getDatabase(app);
const analytics: Analytics = getAnalytics(app);
const functions: Functions = getFunctions(app);
const messaging: Messaging = getMessaging(app);
const performance = getPerformance(app);

export { analytics, app, appCheck, auth, database, db, functions, messaging, performance, storage, vertexAIClient };