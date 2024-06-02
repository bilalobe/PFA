import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Menu, MenuItem, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../actions/authActions';

function Navbar() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
  
    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
  
    const handleLogout = () => {
      dispatch(logoutUser());
    };
  
    const handleProfile = () => {
      // Redirect the user to the profile page or any other desired page
      window.location.href = '/profile'; 
    };
  


  return (
    <AppBar position="static">
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
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/modules/1">  {/* Assuming '1' is a sample courseId */}
            Modules
          </Button>
          <Button color="inherit" component={Link} to="/recommendations">
            Recommendations
          </Button>
          <Button color="inherit" component={Link} to="/edit-profile">
            Edit Profile
          </Button>
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem component={Link} to="/" onClick={handleMenuClose}>
              Home
            </MenuItem>
            <MenuItem component={Link} to="/modules/1" onClick={handleMenuClose}>
              Modules
            </MenuItem>
            <MenuItem component={Link} to="/recommendations" onClick={handleMenuClose}>
              Recommendations
            </MenuItem>
            <MenuItem component={Link} to="/edit-profile" onClick={handleMenuClose}>
              Edit Profile
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
