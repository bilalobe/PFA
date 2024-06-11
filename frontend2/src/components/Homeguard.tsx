import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile, logoutUser } from '../types/features/user/userSlice';
import {
  Box,
  CircularProgress,
  Drawer,
  List,
  ListItemText,
  ListItemIcon,
  IconButton,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
  Alert,
  ListItemButton,
  Link,
  Divider,
  styled,
  useLocation,
} from '@mui/material';
import { createSelector } from 'reselect';
import dynamic from 'next/dynamic';
import { RootState } from '../types/index';
import { useRouter } from 'next/router';
import PrivateRoute from '../utils/PrivateRoute';
import { Dispatch, UnknownAction } from '@reduxjs/toolkit/react';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import ForumIcon from '@mui/icons-material/Forum';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';


const Dashboard = dynamic(() => import('../pages/dashboard'));
const drawerWidth = 240;

const selectUserAndAuthState = createSelector(
  (state: RootState) => ({
    profile: state.user.profile,
    loading: state.user.loading,
    error: state.user.error,
    isAuthenticated: state.auth.isAuthenticated,
  }),
  (userAndAuth) => userAndAuth
);

const DrawerContent: React.FC<{ handleDrawerClose: () => void; handleLogout: () => void }> = ({
  handleDrawerClose,
  handleLogout,
}) => (
  <div>
    <Toolbar className="flex justify-end">
      <IconButton onClick={handleDrawerClose} className="text-white">
        <ChevronLeftIcon />
      </IconButton>
    </Toolbar>
    <Divider />
    <List>
      {/* List items */}
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  </div>
);

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    background-color: #f5f5f5; /* Customize background color */
    border-radius: 8px; /* Add rounded corners */
  }
`;

const HomeGuard: React.FC = () => {
  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const router = useRouter();
  const location = useLocation(); // Track current route for active styling
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { error } = useSelector((state: RootState) => state.user);

  const user = useSelector((state: RootState) => state.user.profile); // Access user data

  const drawerItems = useMemo(() => [
    { href: '/', text: 'Home', Icon: HomeIcon },
    { href: '/courses', text: 'Courses', Icon: SchoolIcon },
    { href: '/forums', text: 'Forums', Icon: ForumIcon },
    { href: '/profile', text: 'Profile', Icon: AccountCircleIcon },
    // Conditionally show admin tools based on user role
    user?.role === 'admin' && { href: '/admin', text: 'Admin Tools', Icon: AdminIcon },
  ].filter(Boolean), [user]);

  useEffect(() => {
    dispatch(fetchUserProfile() as any);
  }, [dispatch]);

  const { loading } = useSelector((state: RootState) => state.user);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser() as any);
    router.push('/login');
  }, [dispatch, router]);

  const [open, setOpen] = useState(false);

  const handleDrawerOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, []);

  const drawerContent = useMemo(() => <DrawerContent handleDrawerClose={handleDrawerClose} handleLogout={handleLogout} />, [handleDrawerClose, handleLogout]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerOpen}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            HomeGuard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open={open}
      >
        <Toolbar />
        <Divider />
        <List>
          {drawerItems.map(({ href, text, Icon }) => (
            <ListItemButton key={href} component={Link} href={href}>
              <ListItemIcon><Icon /></ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {error && <Alert severity="error">{error}</Alert>}
        <PrivateRoute isAuthenticated={isAuthenticated}>
          <Dashboard />
        </PrivateRoute>
      </Box>
    </Box>
  );
};

export default HomeGuard;
