import { 
  ref, 
  uploadBytesResumable,
  getDownloadURL 
} from 'firebase/storage';
import  {storage} from '../firebaseConfig.js';

interface UseFirebaseStorage {
  uploadFile: (file: File, folder: string) => Promise<string>;
}

export const useFirebaseStorage = (): UseFirebaseStorage => {
  const uploadFile = async (file: File, folder: string): Promise<string> => {
    try {
      const storageRef = ref(storage, `${folder}/${file.name}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            console.error('Error uploading file:', error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            }).catch((error) => {
              console.error('Error getting download URL:', error);
              reject(error);
            });
          }
        );
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  return { uploadFile };
};