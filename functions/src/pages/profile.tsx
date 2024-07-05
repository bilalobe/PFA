import { Box, Card, CardContent } from '@material-ui/core';
import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { ProfileView } from '../components/Users/ProfileView';
import { User } from '../interfaces/user';
import { firebase } from '../utils/firebase';
import React from 'react';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [profile, setProfile] = useState<User>(user);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRef = firebase.firestore().collection('users').doc(user.id);
        const snapshot = await userRef.get();

        if (snapshot.exists) {
          const userData = snapshot.data() as User;
          setProfile(userData);
        } else {
          throw new Error('User data not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchProfile();
  }, [user.id]);

  return (
    <Box>
      <Card>
        <CardContent>
          <Box>
            {isEditing ? (
              <ProfileEdit user={profile} onCancel={handleCancel} />
            ) : (
              <ProfileView profile={profile} onEdit={handleEdit} />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const token = context.req.cookies.token;

    if (!token) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Authenticate with Firebase using the token
    await firebase.auth().signInWithCustomToken(token);

    const user = firebase.auth().currentUser;

    if (!user) {
      throw new Error('User not found');
    }

    const userData: User = {
      id: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      // Add other user properties as needed
    };

    return { props: { user: userData } };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};

export default Profile;