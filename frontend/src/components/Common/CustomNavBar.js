import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from './CustomButton';
import { logoutUser } from '../../actions/authActions';
import logo from '../../assets/logo.png';

function Navbar() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
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

    const renderNavLinks = () => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                return (
                    <>
                        <CustomButton color="inherit" component={Link} to="/admin/dashboard">
                            Admin Dashboard
                        </CustomButton>
                        <CustomButton color="inherit" component={Link} to="/profile">
                            Profile
                        </CustomButton>
                    </>
                );
            } else if (user.role === 'teacher') {
                return (
                    <>
                        <CustomButton color="inherit" component={Link} to="/teacher/dashboard">
                            Teacher Dashboard
                        </CustomButton>
                        <CustomButton color="inherit" component={Link} to="/profile">
                            Profile
                        </CustomButton>
                    </>
                );
            } else if (user.role === 'student') {
                return (
                    <>
                        <CustomButton color="inherit" component={Link} to="/student/dashboard">
                            Student Dashboard
                        </CustomButton>
                        <CustomButton color="inherit" component={Link} to="/profile">
                            Profile
                        </CustomButton>
                    </>
                );
            }
        }

        return (
            <>
                <CustomButton color="inherit" component={Link} to="/login">
                    Login
                </CustomButton>
                <CustomButton color="inherit" component={Link} to="/register">
                    Register
                </CustomButton>
            </>
        );
    };

    return (
        <AppBar position="static" sx={{ bgcolor: 'primary.main', py: 1 }}>
            <Toolbar>
                <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexGrow: 1 }}>
                    <img src={logo} alt="logo" style={{ width: '40px', marginRight: '10px' }} />
                    <Typography variant="h6" sx={{ color: 'inherit', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        MyApp
                    </Typography>
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <CustomButton color="inherit" component={Link} to="/">
                        Home
                    </CustomButton>
                    {renderNavLinks()}
                    {isAuthenticated && (
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
                    PaperProps={{
                        sx: {
                            backgroundColor: 'primary.main',
                            color: 'white',
                        },
                    }}
                    aria-label="main navigation"
                >
                    <MenuItem component={Link} to="/" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>
                        Home
                    </MenuItem>
                    {isAuthenticated && user?.role === 'admin' && (
                        <>
                            <MenuItem component={Link} to="/admin/dashboard" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>
                                Admin Dashboard
                            </MenuItem>
                            <MenuItem component={Link} to="/profile" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>
                                Profile
                            </MenuItem>
                        </>
                    )}
                    {isAuthenticated && user?.role === 'teacher' && (
                        <>
                            <MenuItem component={Link} to="/teacher/dashboard" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>
                                Teacher Dashboard
                            </MenuItem>
                            <MenuItem component={Link} to="/profile" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>
                                Profile
                            </MenuItem>
                        </>
                    )}
                    {isAuthenticated && user?.role === 'student' && (
                        <>
                            <MenuItem component={Link} to="/student/dashboard" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>
                                Student Dashboard
                            </MenuItem>
                            <MenuItem component={Link} to="/profile" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>
                                Profile
                            </MenuItem>
                        </>
                    )}
                    {!isAuthenticated && (
                        <>
                            <MenuItem component={Link} to="/login" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>
                                Login
                            </MenuItem>
                            <MenuItem component={Link} to="/register" onClick={handleMenuClose} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>
                                Register
                            </MenuItem>
                        </>
                    )}
                    {isAuthenticated && (
                        <MenuItem onClick={handleLogout} sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}>
                            Logout
                        </MenuItem>
                    )}
                </Menu>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
