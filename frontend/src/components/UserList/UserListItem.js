import React from 'react';
import { Card, CardContent, Typography, Avatar, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';

function UserListItem({ user }) {
  return (
    <Card
      sx={{
        boxShadow: 3,
        borderRadius: 2,
        '&:hover': { boxShadow: 6, backgroundColor: '#f0f0f0' },
        outline: 'none',
        '&:focus-within': {
          outline: '3px solid #007bff',
          boxShadow: '0 0 5px #007bff',
        },
      }}
      tabIndex={0}
      aria-label={`User card for ${user.name}`}
    >
      <Box display="flex" alignItems="center" p={2}>
        {user.profilePicture ? (
          <Avatar
            alt={`Profile picture of ${user.name}`}
            src={user.profilePicture}
            sx={{ width: 56, height: 56, marginRight: 2 }}
            aria-label={`Profile picture of ${user.name}`}
          />
        ) : (
          <Avatar
            alt={`Profile icon for ${user.name}`}
            sx={{ width: 56, height: 56, marginRight: 2 }}
            aria-label={`Profile icon for ${user.name}`}
          >
            <AccountCircle />
          </Avatar>
        )}
        <CardContent sx={{ flex: '1 1 auto' }}>
          <Typography variant="h6" component="div">
            {user.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user.email}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user.type} {user.bio && ` - ${user.bio}`}
          </Typography>
        </CardContent>
        <IconButton
          component={Link}
          to={`/user/${user.id}`}
          aria-label={`View ${user.name}'s profile`}
          sx={{ marginLeft: 'auto' }}
        >
          <AccountCircle />
        </IconButton>
      </Box>
    </Card>
  );
}

export default UserListItem;
