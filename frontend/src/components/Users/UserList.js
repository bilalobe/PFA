import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, setSearchQuery, setCurrentPage } from '../../actions/userActions';
import CustomInput from '../Common/CustomInput'; 
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment,
  IconButton
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import ClearIcon from '@mui/icons-material/Clear';
import Fuse from 'fuse.js'; // For fuzzy search

/**
 * Renders a list of users with search and pagination functionality.
 *
 * @returns {JSX.Element} The UserList component.
 */
const UserList = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error, searchQuery, currentPage, usersPerPage } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(fetchUsers({ searchQuery, page: currentPage, usersPerPage }));
  }, [dispatch, searchQuery, currentPage, usersPerPage]);

  const handleSearchChange = (event) => {
    dispatch(setSearchQuery(event.target.value));
    dispatch(setCurrentPage(1));
  };

  const handleClearSearch = () => {
    dispatch(setSearchQuery(''));
  };

  const handlePageChange = (event, value) => {
    dispatch(setCurrentPage(value));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="Loading users">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="Error message">
        <Alert severity="error">{`Error loading users: ${error}`}</Alert>
      </Box>
    );
  }

  // Implement fuzzy search
  const fuse = new Fuse(users, {
    keys: ['name', 'email', 'type'],
    includeScore: true
  });

  const filteredUsers = searchQuery ? fuse.search(searchQuery).map(result => result.item) : users;

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        User List
      </Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <CustomInput
          label="Search Users"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} aria-label="Clear search">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          aria-label="Search Users"
        />
      </Box>
      <Grid container spacing={2}>
        {filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map((user) => (
          <Grid item key={user.id} xs={12} md={6} lg={4}>
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
                    <AccountCircleIcon />
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
                  <AccountCircleIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(filteredUsers.length / usersPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          aria-label="Pagination"
        />
      </Box>
    </Box>
  );
};

export default UserList;
