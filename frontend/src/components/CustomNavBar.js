import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Menu, MenuItem, Box, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../actions/authActions';  // Assuming you have this action

const CustomNavBar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);  // Adjust according to your auth state
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const theme = useTheme();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    handleMenuClose();
  };

  return (
    <AppBar position="static" sx={{ bgcolor: theme.palette.primary.main }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
          sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          MyApp
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/modules/1">Modules</Button>
          <Button color="inherit" component={Link} to="/recommendations">Recommendations</Button>
          <Button color="inherit" component={Link} to="/edit-profile">Edit Profile</Button>
          {isAuthenticated && <Button color="inherit" component={Link} to="/">Profile</Button>}
          {isAuthenticated ? (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          )}
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem component={Link} to="/" onClick={handleMenuClose}>Home</MenuItem>
            <MenuItem component={Link} to="/modules/1" onClick={handleMenuClose}>Modules</MenuItem>
            <MenuItem component={Link} to="/recommendations" onClick={handleMenuClose}>Recommendations</MenuItem>
            <MenuItem component={Link} to="/edit-profile" onClick={handleMenuClose}>Edit Profile</MenuItem>
            {isAuthenticated && <MenuItem component={Link} to="/" onClick={handleMenuClose}>Profile</MenuItem>}
            {isAuthenticated ? (
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            ) : (
              <MenuItem component={Link} to="/login" onClick={handleMenuClose}>Login</MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CustomNavBar;
