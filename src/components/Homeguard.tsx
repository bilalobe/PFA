import React, { useState, useCallback, Suspense } from 'react';
import {
  Box, CircularProgress, Drawer, List, ListItemText, ListItemIcon, IconButton,
  Toolbar, AppBar, Typography, CssBaseline, ListItemButton, Divider, styled
} from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PrivateRoute from '../utils/PrivateRoute';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import ForumIcon from '@mui/icons-material/Forum';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import dynamic from 'next/dynamic';

import 'react-chatbot-kit/build/main.css';

import { HomeGuardProps } from '../interfaces/props';
import { useAuth } from '../hooks/useAuth';

// Lazy load Dashboard
const Dashboard = React.lazy(() => import('../pages/dashboard'));
const ChatbotContainer = dynamic(() => import('./AI/ChatbotContainer'), { ssr: false });

const drawerWidth = 240;

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
        <ListItemButton component={Link} href="/" passHref>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton component={Link} href="/courses" passHref>
          <ListItemIcon>
            <SchoolIcon />
          </ListItemIcon>
          <ListItemText primary="Courses" />
        </ListItemButton>
        <ListItemButton component={Link} href="/forum" passHref>
          <ListItemIcon>
            <ForumIcon />
          </ListItemIcon>
          <ListItemText primary="Forum" />
        </ListItemButton>
        <ListItemButton component={Link} href="/profile" passHref>
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

const HomeGuard: React.FC<HomeGuardProps> = ({ isAuthenticated, user }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    logout()
      .then(() => {
        router.push('/login');
      })
      .catch((err: Error) => {
        console.error(err.message);
      });
  }, [logout, router]);

  const handleDrawerOpen = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <ChatbotContainer user={user} conversation={[]} chatRoomId={undefined}>
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
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Suspense fallback={<CircularProgress />}>
              <Dashboard />
            </Suspense>
          </PrivateRoute>
        </Box>
      </Box>
    </ChatbotContainer>
  );
};

export default HomeGuard;

function useChatbotContext(): { toggleChatbotVisibility: any; } {
  // Implement the chatbot context or replace with actual implementation
  return { toggleChatbotVisibility: () => {} };
}
