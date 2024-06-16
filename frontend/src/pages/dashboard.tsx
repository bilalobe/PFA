import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../features/userSlice';
import { Box, Container, CircularProgress, Typography, Drawer, List, ListItem, ListItemText, ListItemIcon, IconButton, Toolbar, AppBar, Alert, Divider } from '@mui/material';
import { Menu as MenuIcon, Home as HomeIcon, School as SchoolIcon, Forum as ForumIcon, AccountCircle as AccountCircleIcon, Logout as LogoutIcon, Chat as ChatIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/authSlice';
import { useAuth } from '../hooks/useAuth';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from '../chatbot/config';
import MessageParser from '../chatbot/MessageParser';
import ActionProvider from '../chatbot/ActionProvider';
import AutoCorrect from '../components/AI/AutoCorrect';
import TextSummarization from '../components/AI/TextSummarization';
import QuestionGeneration from '../components/AI/QuestionGeneration';

const drawerWidth = 240;

function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector((state) => state.user.profile);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const authorizedRoles = ['admin', 'teacher'];
  if (!user || !authorizedRoles.includes(user.role)) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/');
    });
  };

  const drawerContent = (
    <List>
      <ListItem button onClick={() => navigate('/')}>
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItem>
      <ListItem button onClick={() => navigate('/courses')}>
        <ListItemIcon>
          <SchoolIcon />
        </ListItemIcon>
        <ListItemText primary="Courses" />
      </ListItem>
      <ListItem button onClick={() => navigate('/forum')}>
        <ListItemIcon>
          <ForumIcon />
        </ListItemIcon>
        <ListItemText primary="Forum" />
      </ListItem>
      <ListItem button onClick={() => navigate('/profile')}>
        <ListItemIcon>
          <AccountCircleIcon />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItem>
      <ListItem button onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
      <Divider />
      <ListItem button onClick={() => setChatbotVisible(!chatbotVisible)}>
        <ListItemIcon>
          <ChatIcon />
        </ListItemIcon>
        <ListItemText primary="Chatbot" />
      </ListItem>
    </List>
  );

  const handleAlertClose = () => {
    setOpenAlert(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer(true)}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          {drawerContent}
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* Add your AI components here */}
        <AutoCorrect />
        <TextSummarization />
        <QuestionGeneration />
        {chatbotVisible && (
          <Chatbot
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        )}
      </Box>
      {openAlert && (
        <Alert severity="error" onClose={handleAlertClose}>
          {alertMessage}
        </Alert>
      )}
    </Box>
  );
}

export default Dashboard;
