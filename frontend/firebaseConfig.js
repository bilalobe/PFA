import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";



const firebaseConfig = {

    apiKey: "AIzaSyDa2GjYbLELjm5zVUFSZdluNlacOjyL8Pg",
  
    authDomain: "eleanor-80b46.firebaseapp.com",
  
    projectId: "eleanor-80b46",
  
    storageBucket: "eleanor-80b46.appspot.com",
  
    messagingSenderId: "489825674554",
  
    appId: "1:489825674554:web:92f39da96b7395c1ab9c03",
  
    measurementId: "G-YS2FBXE2FJ"
  
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

// Export the services for use in other files
export { auth, db, storage, database };