import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { handleApiError } from "../utils/errorHandling";

export const gamificationApi = {
  // Award points to a user
  awardPoints: async (userId: string, points: number): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        points: increment(points)
      });
    } catch (error) {
      handleApiError(error, `Failed to award points to user ${userId}.`);
    }
  },

  // Deduct points from a user
  deductPoints: async (userId: string, points: number): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        points: increment(-points)
      });
    } catch (error) {
      handleApiError(error, `Failed to deduct points from user ${userId}.`);
    }
  },

  // Get user's current points 
  getUserPoints: async (userId: string): Promise<number> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists() && userDoc.data().points) {
        return userDoc.data().points;
      }
      return 0;
    } catch (error) {
      handleApiError(error, `Failed to get points for user ${userId}.`);
      return 0;
    }
  },

  // Add a badge to a user
  addBadge: async (userId: string, badge: string): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        badges: arrayUnion(badge)
      });
    } catch (error) {
      handleApiError(error, `Failed to add badge to user ${userId}.`);
    }
  },

  // Get leaderboard
  getLeaderboard: async (limitCount: number = 10): Promise<Array<{ userId: string, points: number }>> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('points', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        userId: doc.id,
        points: doc.data().points || 0
      }));
    } catch (error) {
      handleApiError(error, 'Failed to get leaderboard.');
      return [];
    }
  }
};

// Helper functions for Firestore operations
function increment(value: number) {
  return { __op: "increment", value };
}

function arrayUnion(value: string) {
  return { __op: "arrayUnion", value };
}

// Import these functions from the common firebase service when implemented
import { getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export default gamificationApi;