import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from "firebase/app-check";
import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  EmailAuthProvider, 
  FacebookAuthProvider, 
  GithubAuthProvider, 
  connectAuthEmulator, 
  setPersistence, 
  browserLocalPersistence, 
  indexedDBLocalPersistence, 
  initializeAuth 
} from "firebase/auth";
import { getDatabase, Database, connectDatabaseEmulator } from "firebase/database";
import { getFirestore, Firestore, connectFirestoreEmulator, enableIndexedDbPersistence } from "firebase/firestore";
import { getFunctions, Functions, connectFunctionsEmulator } from "firebase/functions";
import { getMessaging, Messaging } from "firebase/messaging";
import { getPerformance } from "firebase/performance";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import "firebase/compat/auth";
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

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Auth with optimal persistence
let auth: Auth;
try {
  // Try to use the more reliable IndexedDB persistence
  auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] });
} catch (e) {
  // Fall back to default auth if initialization with persistence fails
  auth = getAuth(app);
  // Try to set persistence after initialization
  setPersistence(auth, browserLocalPersistence).catch(error => {
    console.warn('Failed to set auth persistence:', error);
  });
}

// Initialize Firestore
const db: Firestore = getFirestore(app);

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn('Firestore persistence failed to enable:', err.code);
  });
}

// Initialize other Firebase services
const storage = getStorage(app);
const database: Database = getDatabase(app);
let analytics: Analytics | null = null;
let performance;

// Only use analytics and performance in browser environment
if (typeof window !== 'undefined') {
  // Only initialize analytics on the client side and if supported
  isSupported().then(yes => yes ? analytics = getAnalytics(app) : null);
  performance = getPerformance(app);
}

const functions: Functions = getFunctions(app);
const messaging: Messaging = getMessaging(app);

// Check if we're in emulator mode
const isEmulatorEnvironment = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

// Connect to emulators in development environment
if (isEmulatorEnvironment || (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectDatabaseEmulator(database, 'localhost', 9000);
  console.log('Using Firebase emulators');
}

const appCheck: AppCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("RECAPTCHA_SITE_KEY"),
  isTokenAutoRefreshEnabled: true
});

// FirebaseUI configuration
const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    EmailAuthProvider.PROVIDER_ID,
    GoogleAuthProvider.PROVIDER_ID,
    FacebookAuthProvider.PROVIDER_ID,
    GithubAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
};

// Define or import FirebaseUIAuthConfig
interface FirebaseUIAuthConfig {
  signInSuccessUrl: string;
  signInOptions: string[];
  signInFlow: string;
}

// Initialize the Vertex AI client
const vertexAIClient = new PredictionServiceClient({
  credentials: {
    client_email: process.env.VERTEX_AI_CLIENT_EMAIL,
    private_key: process.env.VERTEX_AI_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  projectId: process.env.VERTEX_AI_PROJECT_ID
});

export { analytics, app, appCheck, auth, database, db, functions, messaging, performance, storage, vertexAIClient, firebaseConfig, uiConfig, isEmulatorEnvironment };
export type { FirebaseApp };
export type { FirebaseUIAuthConfig };