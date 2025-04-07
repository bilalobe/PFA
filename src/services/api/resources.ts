import { auth } from "../../firebaseConfig";
import { firestoreService, queryBuilders } from "../firebase/firestore";
import { storageService } from "../firebase/storage";
import { handleApiError } from "../utils/errorHandling";
import { Resource } from "../../interfaces/types";

export const resourceApi = {
  fetchResourcesForModule: async (moduleId: string) => {
    try {
      const constraints = [queryBuilders.whereField('moduleId', '==', moduleId)];
      const result = await firestoreService.list<Resource>('resources', constraints);
      
      // Add download URLs for each resource
      const resourcesWithUrls = await Promise.all(
        result.items.map(async (resource) => {
          try {
            const downloadUrl = await storageService.getDownloadUrl(resource.filePath);
            return { ...resource, downloadUrl };
          } catch (error) {
            console.error(`Failed to get download URL for resource ${resource.id}:`, error);
            return { ...resource, downloadUrl: null };
          }
        })
      );
      
      return resourcesWithUrls;
    } catch (error) {
      handleApiError(error, `Failed to fetch resources for module ${moduleId}.`);
      throw error;
    }
  },

  uploadResource: async (moduleId: string, file: File, onUploadProgress?: (progress: number) => void) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const path = `resources/${user.uid}/${moduleId}/${file.name}`;
      
      // Upload file to Firebase Storage
      const downloadUrl = await storageService.uploadFile(path, file, onUploadProgress);
      
      // Create the resource document in Firestore
      const resourceData: Omit<Resource, 'id'> = {
        title: file.name,
        description: "",
        moduleId,
        uploadedBy: user.uid,
        uploadDate: new Date(),
        fileType: file.type,
        filePath: path,
        downloadUrl,
        downloadCount: 0,
        url: downloadUrl,
        type: file.type
      };
      
      return await firestoreService.create<Resource>('resources', resourceData);
    } catch (error) {
      handleApiError(error, "Failed to upload resource.");
      throw error;
    }
  },

  updateResource: async (resourceId: string, updates: Partial<Resource>) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }
      
      // Get the resource to check permissions
      const resource = await firestoreService.get<Resource>('resources', resourceId);
      
      // Check if user has permission
      if (resource.uploadedBy !== user.uid) {
        throw new Error("You are not authorized to update this resource.");
      }
      
      return await firestoreService.update<Resource>('resources', resourceId, updates);
    } catch (error) {
      handleApiError(error, `Failed to update resource ${resourceId}.`);
      throw error;
    }
  },

  deleteResource: async (resourceId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }
      
      // Get the resource to check permissions and get the file path
      const resource = await firestoreService.get<Resource>('resources', resourceId);
      
      // Check if user has permission
      if (resource.uploadedBy !== user.uid) {
        throw new Error("You are not authorized to delete this resource.");
      }
      
      // Delete the file from storage
      await storageService.deleteFile(resource.filePath);
      
      // Delete the document from Firestore
      return await firestoreService.delete('resources', resourceId);
    } catch (error) {
      handleApiError(error, `Failed to delete resource ${resourceId}.`);
      throw error;
    }
  },

  incrementDownloadCount: async (resourceId: string) => {
    try {
      const resource = await firestoreService.get<Resource>('resources', resourceId);
      await firestoreService.update<Resource>('resources', resourceId, {
        downloadCount: (resource.downloadCount || 0) + 1
      });
    } catch (error) {
      console.error("Error incrementing download count:", error);
      // We don't throw here as download count isn't critical
    }
  }
};