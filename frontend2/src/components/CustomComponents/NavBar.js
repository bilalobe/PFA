import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box, Link, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelector, useDispatch } from 'react-redux'; 
import { logoutUser } from '../../actions/authActions';
import CustomButton from './CustomButton';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../../assets/logo.png';

const MenuItems = ({ user, handleMenuClose, handleLogout }) => {
  if (user && user.role === 'admin') {
    return (
      <>
        <MenuItem component={Link} href="/admin/dashboard" onClick={handleMenuClose}>
          <ListItemIcon>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Admin Dashboard</Typography>
        </MenuItem>
        {/* ... other admin links ... */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Logout</Typography>
        </MenuItem>
      </>
    );
  }
  // Add other roles here
  return null;
};

MenuItems.propTypes = {
  user: PropTypes.object,
  handleMenuClose: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

function CustomNavbar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    handleMenuClose();
  }, [dispatch, handleMenuClose]);

  useMemo(() => <MenuItems user={user} handleMenuClose={handleMenuClose} handleLogout={handleLogout} />, [user, handleMenuClose, handleLogout]);

  const renderNavLinks = () => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          return (
            <>
              <MenuItem component={Link} href="/admin/dashboard" onClick={handleMenuClose}>
                <ListItemIcon>
                  <HomeIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Admin Dashboard</Typography>
              </MenuItem>
              {/* ... other admin links ... */}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Logout</Typography>
              </MenuItem>
            </>
          );
        case 'teacher':
          return (
            <>
              <MenuItem component={Link} href="/teacher/dashboard" onClick={handleMenuClose}>
                <ListItemIcon>
                  <HomeIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Teacher Dashboard</Typography>
              </MenuItem>
              {/* ... other teacher links ... */}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Logout</Typography>
              </MenuItem>
            </>
          );
        case 'student':
          return (
            <>
              <MenuItem component={Link} href="/student/dashboard" onClick={handleMenuClose}>
                <ListItemIcon>
                  <HomeIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Student Dashboard</Typography>
              </MenuItem>
              {/* ... other student links ... */}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Logout</Typography>
              </MenuItem>
            </>
          );
        default:
          return null;
      }
    }
    return (
      <>
        <MenuItem component={Link} href="/login" onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Login</Typography>
        </MenuItem>
        <MenuItem component={Link} href="/register" onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Register</Typography>
        </MenuItem>
      </>
    );
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'primary.main', py: 1 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexGrow: 1 }}>
          <Link href="/">
            <a> 
              <img src={logo} alt="logo" style={{ width: '40px', marginRight: '10px' }} />
              <Typography variant="h6" sx={{ color: 'inherit', fontWeight: 'bold', fontSize: '1.2rem' }}>
                MyApp 
              </Typography>
            </a>
          </Link>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <CustomButton color="inherit">
            <Link href="/">
              <a>Home</a>
            </Link>
          </CustomButton>
          {renderNavLinks()} 
        </Box>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={handleMenuOpen}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          slotProps={{
            sx: {
              backgroundColor: 'primary.main',
              color: 'white',
            },
          }}
        >
          {renderNavLinks()} 
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default CustomNavbar;
