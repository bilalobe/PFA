import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile, logoutUser } from '../features/userSlice';
import {
  Box, CircularProgress, Drawer, List, ListItemText, ListItemIcon, IconButton,
  Toolbar, AppBar, Typography, CssBaseline, Alert, ListItemButton, Link, Divider, styled
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { createSelector } from 'reselect';
import { useRouter } from 'next/router';
import PrivateRoute from '../utils/PrivateRoute';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import ForumIcon from '@mui/icons-material/Forum';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import dynamic from 'next/dynamic';
import { RootState } from '../store';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from '../chatbot/config';
import MessageParser from '../chatbot/MessageParser';
import ActionProvider from '../chatbot/ActionProvider';

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
  handleDrawerClose, handleLogout
}) => (
  <div>
    <Toolbar>
      <IconButton onClick={handleDrawerClose}>
        <ChevronLeftIcon />
      </IconButton>
    </Toolbar>
    <Divider />
    <List>
      <ListItemButton component={Link} href="/">
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItemButton>
      <ListItemButton component={Link} href="/courses">
        <ListItemIcon>
          <SchoolIcon />
        </ListItemIcon>
        <ListItemText primary="Courses" />
      </ListItemButton>
      <ListItemButton component={Link} href="/forum">
        <ListItemIcon>
          <ForumIcon />
        </ListItemIcon>
        <ListItemText primary="Forum" />
      </ListItemButton>
      <ListItemButton component={Link} href="/profile">
        <ListItemIcon>
          <AccountCircleIcon />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItemButton>
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
      <Divider />
      <ListItemButton component={Link} href="#" onClick={() => setChatbotVisible(prev => !prev)}>
        <ListItemIcon>
          <ChatIcon />
        </ListItemIcon>
        <ListItemText primary="Chatbot" />
      </ListItemButton>
    </List>
  </div>
);

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    background-color: #f5f5f5;
    border-radius: 8px;
  }
`;

const Dashboard = dynamic(() => import('../pages/dashboard'));

const HomeGuard: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const location = useLocation();

  const { profile, loading, error, isAuthenticated } = useSelector(selectUserAndAuthState);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser()).then(() => {
      router.push('/login');
    });
  }, [dispatch, router]);

  const handleDrawerOpen = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const drawerItems = useMemo(() => [
    { href: '/', text: 'Home', Icon: HomeIcon },
    { href: '/courses', text: 'Courses', Icon: SchoolIcon },
    { href: '/forum', text: 'Forum', Icon: ForumIcon },
    { href: '/profile', text: 'Profile', Icon: AccountCircleIcon },
    profile?.role === 'admin' && { href: '/admin', text: 'Admin Tools', Icon: AdminIcon },
  ].filter(Boolean), [profile]);

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
      <StyledDrawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Divider />
        <DrawerContent handleDrawerClose={handleDrawerClose} handleLogout={handleLogout} />
      </StyledDrawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        <PrivateRoute isAuthenticated={isAuthenticated}>
          <Dashboard />
          {chatbotVisible && (
            <Chatbot
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          )}
        </PrivateRoute>
      </Box>
    </Box>
  );
};

export default HomeGuard;
