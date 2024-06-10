import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Typography, Divider, ListItemAvatar, Avatar, CircularProgress, Alert } from '@mui/material';
import { useRouter } from 'next/router';

function PrivateChatList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users/');
        setUsers(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUserClick = (userId: any) => {
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
          <ListItem button onClick={() => handleUserClick(user.id)}>
            <ListItemAvatar>
              <Avatar alt={user.name} src={user.profile_picture} />
            </ListItemAvatar>
            <ListItemText primary={user.name} />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
}

export default PrivateChatList;
