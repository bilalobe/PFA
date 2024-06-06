import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelector, useDispatch } from 'react-redux'; 
import { logoutUser } from '../../redux/actions/authActions';
import CustomButton from './CustomButton';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as NextLink } from 'next/link'; 
import { makeStyles } from '@mui/styles';

const MenuItems = ({ user, handleMenuClose, handleLogout }: { user: any, handleMenuClose: () => void, handleLogout: () => void }) => {
  if (user && user.role === 'admin') {
    return (
      <div>
        <MenuItem component={NextLink} href="/admin/dashboard" onClick={handleMenuClose}>
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
      </div>
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


const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: '#333',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function CustomNavbar() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleMenu = (event) => {
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
    <AppBar position="static" className={classes.appBar}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenu} className={classes.menuButton}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          App Name
        </Typography>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          onClose={handleMenuClose}
        >
          <MenuItems user={user} handleMenuClose={handleMenuClose} handleLogout={handleLogout} />
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default CustomNavbar;