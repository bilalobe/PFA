import React, { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile, logoutUser } from '@/types/features/user/userSlice';
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
import { RootState } from '@/types/store';
import { ChatbotProvider, useChatbotContext } from '@/contexts/ChatbotContext'; // Custom Context API for Chatbot state
import { NotificationsProvider, useNotifications } from '@/contexts/NotificationsContext'; // Custom Context API for Notifications
import 'react-chatbot-kit/build/main.css';
import MessageParser from '@/components/AI/MessageParser';
import ActionProvider from '@/components/AI/ActionProvider';
import error from 'next/error';

// Lazy load Dashboard
const Dashboard = React.lazy(() => import('../pages/dashboard'));
const Chatbot = dynamic(() => import('@/components/AI/Chatbot'), { ssr: false });

const drawerWidth = 240;

const selectUserAndAuthState = createSelector(
  (state: RootState) => ({
    profile: state.user.profile,
    loading: state.user.loading,
    isAuthenticated: state.auth.isAuthenticated,
  }),
  (userAndAuth) => userAndAuth
);

const DrawerContent: React.FC<{ handleDrawerClose: () => void; handleLogout: () => void }> = ({
  handleDrawerClose, handleLogout
}) => {
  const { toggleChatbotVisibility } = useChatbotContext();

  return (
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
        <ListItemButton onClick={toggleChatbotVisibility}>
          <ListItemIcon>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText primary="Chatbot" />
        </ListItemButton>
      </List>
    </div>
  );
};

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    background-color: #f5f5f5;
    border-radius: 8px;
  }
`;

type HomeGuardProps = {
  isAuthenticated: boolean;
};

const HomeGuard: React.FC<HomeGuardProps> = ({ isAuthenticated }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const location = useLocation();
  const { addNotification } = useNotifications();
  const { profile, loading, isAuthenticated: authIsAuthenticated } = useSelector(selectUserAndAuthState);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser()).then(() => {
      router.push('/login');
    }).catch((err: Error) => {
      addNotification({ type: 'error', message: err.message });
    });
  }, [dispatch, router, addNotification]);

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

  if (loading) return <CircularProgress />;
  if (error) {
    const errorMessage = error.toString();
    return <Alert severity="error">{errorMessage}</Alert>;
  }

  return (
    <ChatbotProvider>
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
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerClose}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
        >
          <DrawerContent handleDrawerClose={handleDrawerClose} handleLogout={handleLogout} />
        </StyledDrawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <PrivateRoute isAuthenticated={authIsAuthenticated}>
            <Suspense fallback={<CircularProgress />}>
              <Dashboard messageParser={() => { throw new Error('Function not implemented.'); }} />
            </Suspense>
          </PrivateRoute>
        </Box>
      </Box>
    </ChatbotProvider>
  );
};

export default HomeGuard;
