import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";
import { getPerformance } from "firebase/performance";





// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);
const analytics = getAnalytics(app);
const functions = getFunctions(app);
const messaging = getMessaging(app);
const performance = getPerformance(app);


// Export the services for use in other files
export { auth, db, storage, database, analytics, functions, messaging, performance, app};