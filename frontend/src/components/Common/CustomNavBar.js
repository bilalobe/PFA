import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from './CustomButton';
import { logoutUser } from '../../actions/authActions';
import logo from '../../assets/logo.png'; // Adjust the path to your logo

function Navbar() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [anchorEl, setAnchorEl] = useState(null);

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
        <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
            <Toolbar>
                <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexGrow: 1 }}>
                    <img src={logo} alt="logo" style={{ width: '40px', marginRight: '10px' }} />
                    <Typography variant="h6" sx={{ color: 'inherit' }}>
                        MyApp
                    </Typography>
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <CustomButton color="inherit" component={Link} to="/">
                        Home
                    </CustomButton>
                    <CustomButton color="inherit" component={Link} to="/modules/1">
                        Modules
                    </CustomButton>
                    <CustomButton color="inherit" component={Link} to="/recommendations">
                        Recommendations
                    </CustomButton>
                    <CustomButton color="inherit" component={Link} to="/edit-profile">
                        Edit Profile
                    </CustomButton>
                    {user ? (
                        <CustomButton color="inherit" component={Link} to={`/profile/${user.id}`}>
                            Profile
                        </CustomButton>
                    ) : (
                        <CustomButton color="inherit" component={Link} to="/login">
                            Login
                        </CustomButton>
                    )}
                    {user && (
                        <CustomButton
                            color="inherit"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                        >
                            Logout
                        </CustomButton>
                    )}
                </Box>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="open menu"
                    onClick={handleMenuOpen}
                    sx={{ display: { xs: 'block', md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: {
                            backgroundColor: 'primary.main',
                            color: 'white',
                        },
                    }}
                    aria-label="main navigation"
                >
                    <MenuItem component={Link} to="/" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>Home</MenuItem>
                    <MenuItem component={Link} to="/modules/1" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>Modules</MenuItem>
                    <MenuItem component={Link} to="/recommendations" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>Recommendations</MenuItem>
                    <MenuItem component={Link} to="/edit-profile" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>Edit Profile</MenuItem>
                    {user ? (
                        <>
                            <MenuItem component={Link} to={`/profile/${user.id}`} onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>Profile</MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>Logout</MenuItem>
                        </>
                    ) : (
                        <MenuItem component={Link} to="/login" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>Login</MenuItem>
                    )}
                </Menu>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
