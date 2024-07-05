import { useState } from 'react'; 
import { 
  ref, 
  uploadBytesResumable,
  getDownloadURL 
} from 'firebase/storage';
import { storage } from '../firebase'; 

export const useFirebaseStorage = () => {
  const uploadFile = async (file, folder: string) => {
    try {
      // Create a unique file reference (adjust as needed)
      const storageRef = ref(storage, `${folder}/${file.name}`); 

      // Upload file and get upload progress
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed', 
          (snapshot) => {
            // Optional: Handle upload progress events 
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // console.log('Upload is ' + progress + '% done');
          }, 
          (error) => {
            // Handle unsuccessful uploads
            console.error('Error uploading file:', error);
            reject(error); 
          }, 
          () => {
            // Handle successful uploads
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              // Resolve the promise with the download URL
              resolve(downloadURL); 
            });
          }
        );
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle the error 
    }
  };

  return { uploadFile };
};