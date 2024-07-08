import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth'; 
import { useFirestoreDocument } from '../hooks/useFirestore';
import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { ProfileView } from '../components/Users/ProfileView';
import ProfileEdit from '../components/Users/ProfileEdit'; 
import { User } from '../interfaces/types';
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { uiConfig } from '../firebaseConfig';
import firebaseui from 'firebaseui';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false); 
  const [updatedProfile, setUpdatedProfile] = useState<User | null>(null);

  useEffect(() => {
    // Cleanup FirebaseUI widget on component unmount
    return () => {
      const ui = firebaseui.auth.AuthUI.getInstance();
      if (ui) {
        ui.delete();
      }
    };
  }, []);

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={getAuth()} />
      </Box>
    );
  }

  const { docData: profile, loading, error } = useFirestoreDocument<User>(`users/${user.uid}`, 'user');

  const handleSave = (userData: User) => {
    setUpdatedProfile(userData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log('User signed out successfully');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    ); 
  }

  if (error) {
    return <Typography variant="body1" color="error">Error: {error}</Typography>;
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box>
            {isEditing ? (
              profile && (
                <ProfileEdit 
                  user={updatedProfile || profile} 
                  onCancel={handleCancel} 
                  onSave={handleSave} 
                />
              )
            ) : (
                <ProfileView 
                  user={updatedProfile || profile}
                  isEditing={isEditing}
                  isLoading={false}
                  onEdit={() => setIsEditing(true)}
                  onCancel={handleCancel}
                  onLogout={handleLogout} 
                  onSave={handleSave}
                  error={null}
                />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;