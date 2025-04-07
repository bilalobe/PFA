import { auth } from "../../firebaseConfig";
import { firestoreService } from "../firebase/firestore";
import { handleApiError } from "../utils/errorHandling";

export const authApi = {
  logout: async () => {
    try {
      await auth.signOut();
    } catch (error) {
      handleApiError(error, 'Logout failed.');
    }
  }
};

export const userApi = {
  getProfile: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      return await firestoreService.get('users', user.uid);
    } catch (error) {
      handleApiError(error, 'Failed to fetch user profile.');
      throw error;
    }
  },

  updateProfile: async (updatedProfileData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      await firestoreService.update('users', user.uid, updatedProfileData);
      return await userApi.getProfile();
    } catch (error) {
      handleApiError(error, 'Failed to update profile.');
      throw error;
    }
  }
};