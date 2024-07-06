import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, ListItemText, Divider, ListItemAvatar, Avatar, CircularProgress, Alert, ListItemButton } from '@mui/material';
import { useRouter } from 'next/router';

interface User {
  id: string;
  name: string;
  profile_picture: string;
}

function PrivateChatList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users/');
        setUsers(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUserClick = (userId: string) => {
    router.push(`/chat/private/${userId}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <List>
      {users.map(user => (
        <React.Fragment key={user.id}>
          <ListItemButton onClick={() => handleUserClick(user.id)}>
            <ListItemAvatar>
              <Avatar alt={user.name} src={user.profile_picture} />
            </ListItemAvatar>
            <ListItemText primary={user.name} />
          </ListItemButton>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
}

export default PrivateChatList;