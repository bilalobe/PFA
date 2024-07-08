import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { DocumentData, doc, onSnapshot } from 'firebase/firestore';

const UserProfile = ({ userId }) => {
  const [userProfile, setUserProfile] = useState<DocumentData | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", userId), (doc) => {
      return setUserProfile(doc.data());
    });

    return () => unsubscribe();
  }, [userId]);

  if (!userProfile) return <div>Loading...</div>;

  return (
    <div>
      <h1>{userProfile.displayName}</h1>
      <p>{userProfile.bio}</p>
    </div>
  );
};

export default UserProfile;