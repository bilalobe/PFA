// frontend2/src/pages/Profile.tsx

import { Box, Card, CardContent } from '@material-ui/core';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { ProfileView } from '../components/ProfileView';
import { User } from '../interfaces/User'; // import the User interface

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Box>
      <Card>
        <CardContent>
          <Box>
            {isEditing ? (
              <ProfileEdit user={user} onCancel={() => setIsEditing(false)} />
            ) : (
              <ProfileView profile={user} onEdit={() => setIsEditing(true)} />
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

    const response = await fetch('http://your-django-backend/api/users/me/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const userData: User = await response.json();
      return { props: { user: userData } };
    } else {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};

export default Profile;