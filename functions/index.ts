import functions from 'firebase-functions';
import admin from 'firebase-admin';
import express from 'express';
const cors = require('cors')({ origin: true }); 
import rateLimit from 'express-rate-limit';
import { ErrorResponse } from './types';
// ...  (Import  other libraries as  needed  -  e.g., for  email,  image processing,  etc.)

const app = express();
app.use(cors()); 
app.use(express.json()); 

// Firebase Admin  SDK Initialization
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket();

// === Security &  Error  Handling === 

// Rate Limiting
const limiter = rateLimit({
    windowMs:  15  *  60 *  1000,  // 15 minutes 
    max:  100, // limit each IP to  100  requests  per windowMs
    message: { error: 'Too many requests from this  IP, please try  again later.', statusCode: 429 } 
});
app.use(limiter); 

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // If you want to  return  a more  detailed error message:
        // return  res.status(401).send({ error: 'Unauthorized.  No  token provided.'  });
        return handleError(res, { message: 'Unauthorized.  No  token provided.'}, 401 ); 
    }

    const idToken = authHeader.split('Bearer ')[1].trim(); 

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken); 
        req.user = decodedToken; 
        next(); // Proceed to the next middleware  or  route handler
    } catch (error) {
        // More descriptive error  message
        return handleError(res, { message: 'Unauthorized. Invalid token.' }, 401); 
    }
};

// Custom  Error Handling  Function (for  consistency)
const handleError  =  (res,  error,  statusCode  =  500)  =>  { 
    // Log the  error for debugging 
    console.error("Error: ", error);
    
    // Prepare the error response, ensuring no sensitive data is leaked.
    const errorResponse: ErrorResponse = { 
        message:  error.message  || 'An unexpected  error  occurred.' 
    };

    if  (statusCode  ===  404) { 
      errorResponse.statusCode  =  404;
    }  

    //  You can customize the error  response  further  based  on  specific error types.
    //  Example:  if  (error.code ===  '...') { ... }

    res.status(statusCode).json(errorResponse); 
};

// === API Routes ===  
// Organize your endpoints logically using comments! 

// ---  USER API  ----
app.get('/users/me', authenticateToken, async (req, res) => { 
    try { 
        const user  = await admin.auth().getUser(req.user.uid);

        // Optionally fetch  additional user data from  Firestore 
        const userDoc = await db.collection('users').doc(req.user.uid).get(); 
        let userDataFromFirestore = {}; 

        if (userDoc.exists) {
            userDataFromFirestore = userDoc.data();
        } else {
            console.warn('User document not found in Firestore.'); 
        }
    
        //  Construct the user object  to send in the  response 
        const  userData = {
            uid: user.uid, 
            email: user.email,
            displayName: user.displayName,
            ...userDataFromFirestore //  Add  data  from Firestore 
            //  You  can include other  user  information here as  needed
        };
        return  res.status(200).json(userData); 
    } catch (error)  { 
        return  handleError(res, error); 
    } 
}); 

app.put('/users/me', authenticateToken, async (req,  res) => {
    //  Get the  data to be updated from  the  request  body 
    const  { displayName, bio } =  req.body; 

    try { 
        //  1. Update user  in  Firebase Authentication 
        await  admin.auth().updateUser(req.user.uid,  {
        displayName,
        }); 

        //  2. Update  the user  data  in  Firestore. 
        await  db.collection('users').doc(req.user.uid).set(
        { bio,  // Include any other fields you want  to  update
        }, 
        { merge: true } 
        );
    
        res.status(200).send("User updated successfully."); 
    } catch  (error) {
        console.error("Error  updating  user:",  error);
        handleError(res,  error); 
    } 
}); 

// ... (Other  endpoints for the User API: create user - likely an admin  endpoint) 

// ---  COURSE  API  ---
// ... your course-related endpoints

//  --- MODULE API ---
//  ... module endpoints ... 

// --- QUIZ API --- 
// ... quiz endpoints,  including  /quizzes/:quizId/questions and /quizzes/:quizId/attempts

//  --- ENROLLMENT API --- 
// ... enrollment  API  endpoints ... 

// --- FORUM  API --- 
// ...  your forum-related  endpoints  ...

// --- CHAT API  ---
//  ... your chat  API endpoints

// --- RESOURCE  API  ---
app.get('/resources', async (req: { query: { moduleId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): void; new(): any; }; }; }) => {
  const { moduleId } = req.query;

  // Build your Firestore query 
  let resourcesQuery = db.collection('resources');

  if (moduleId) {
    resourcesQuery = resourcesQuery.where('moduleId', '==', moduleId); 
  } 

  // Additional filters 
  // if (req.query.category) { 
  //   resourcesQuery = resourcesQuery.where('category', '==', req.query.category)
  // }

  try { 
    const snapshot = await resourcesQuery.get();
    const resources = snapshot.docs.map((doc) => {
        const data = doc.data(); 
        return { 
            id: doc.id, 
            ...data,
            downloadUrl: data.downloadUrl // Assuming you have this field
        };
    });

    res.status(200).json(resources);

  } catch (error) {
    handleError(res, error); 
  } 
}); 
app.post('/resources', authenticateToken, async (req: { user: any; method: string; headers: any; pipe: (arg0: any) => void; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; json: { (arg0: { id?: any; error?: string; }): void; new(): any; }; }; }) => {
  // Handle resource upload using Busboy, similar to your previous implementation.
  // 1. Authenticate the user.
  // 2. Use Busboy to handle the file upload.
  // 3. Save the file to Firebase Storage.
  // 4. Store resource information (including download URL) in Firestore.
  // 5. Return a success response to the client.
});

app.get('/resources/:resourceId/download', authenticateToken, async (req, res) => {
  // ...
});

app.get('/resources/:resourceId', authenticateToken, async (req, res) => {
  // ...
});

app.delete('/resources/:resourceId', authenticateToken, async (req, res) => {
  // ...
});

// ... (Example: exports.dailyCleanupTask)

exports.api = functions.https.onRequest(app); 