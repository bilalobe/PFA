import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logoutUser } from '../../actions/authActions';
import CustomButton from './CustomButton'; 
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import ForumIcon from '@mui/icons-material/Forum';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../../assets/logo.png'; // Assuming you have a logo

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
            switch (user.role) {
                case 'admin':
                    return (
                        <>
                            <MenuItem component={Link} to="/admin/dashboard" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <HomeIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Admin Dashboard</Typography>
                            </MenuItem>
                            <MenuItem component={Link} to="/courses" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <SchoolIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Courses</Typography>
                            </MenuItem>
                            <MenuItem component={Link} to="/forum" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <ForumIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Forum</Typography>
                            </MenuItem>
                            <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <AccountCircleIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Profile</Typography>
                            </MenuItem>
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
                            <MenuItem component={Link} to="/teacher/dashboard" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <HomeIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Teacher Dashboard</Typography>
                            </MenuItem>
                            <MenuItem component={Link} to="/courses" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <SchoolIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Courses</Typography>
                            </MenuItem>
                            <MenuItem component={Link} to="/forum" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <ForumIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Forum</Typography>
                            </MenuItem>
                            <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <AccountCircleIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Profile</Typography>
                            </MenuItem>
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
                            <MenuItem component={Link} to="/student/dashboard" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <HomeIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Student Dashboard</Typography>
                            </MenuItem>
                            <MenuItem component={Link} to="/courses" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <SchoolIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Courses</Typography>
                            </MenuItem>
                            <MenuItem component={Link} to="/forum" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <ForumIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Forum</Typography>
                            </MenuItem>
                            <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <AccountCircleIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit">Profile</Typography>
                            </MenuItem>
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
                <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
                    <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit">Login</Typography>
                </MenuItem>
                <MenuItem component={Link} to="/register" onClick={handleMenuClose}>
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
                >
                    {renderNavLinks()}
                </Menu>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
