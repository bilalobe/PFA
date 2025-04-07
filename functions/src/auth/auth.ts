import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Set custom claims to define user roles
export const setUserRole = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an authenticated admin user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  try {
    // Verify the requester is an admin
    const requesterSnapshot = await admin.firestore().collection('users')
      .doc(context.auth.uid).get();
    
    if (!requesterSnapshot.exists || requesterSnapshot.data()?.userType !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can update user roles.'
      );
    }
    
    const { userId, role } = data;
    
    if (!userId || !role) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters userId or role.'
      );
    }
    
    // Valid roles for the system
    const validRoles = ['student', 'teacher', 'supervisor', 'admin'];
    if (!validRoles.includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Role must be one of: ${validRoles.join(', ')}`
      );
    }
    
    // Update custom claims
    await admin.auth().setCustomUserClaims(userId, { userType: role });
    
    // Update user document in Firestore
    await admin.firestore().collection('users').doc(userId).update({
      userType: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, message: `User ${userId} role updated to ${role}` };
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while updating the user role.'
    );
  }
});