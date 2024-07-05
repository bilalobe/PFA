import React, { useEffect, useState, useCallback, Dispatch } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppBar, Box, CircularProgress, Container, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Alert, Divider } from '@mui/material';
import { AccountCircle as AccountCircleIcon, Chat as ChatIcon, Forum as ForumIcon, Home as HomeIcon, Logout as LogoutIcon, Menu as MenuIcon, School as SchoolIcon } from '@mui/icons-material';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { fetchUserProfile } from '@/types/features/user/userSlice';
import Chatbot from '@/components/AI/Chatbot';
import AutoCorrect from '../components/AI/AutoCorrect';
import QuestionGeneration from '@/components/AI/QuestionGeneration';
import TextSummarization from '@/components/AI/TextSummarization';
import ActionProvider from '@/components/AI/ActionProvider';
import MessageParser from '@/components/AI/MessageParser';
import config from '@/components/AI/chatbotConfig';

const drawerWidth = 240;

const DrawerContent = ({ navigate, toggleChatbot }) => {
  const dispatch = useDispatch();

  const handleLogout = useCallback(() => {
    signOut(auth).then(() => {
      navigate('/');
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  }, [navigate]);

  return (
    <List>
      {[
        { text: 'Home', icon: <HomeIcon />, action: () => navigate('/') },
        { text: 'Courses', icon: <SchoolIcon />, action: () => navigate('/courses') },
        { text: 'Forum', icon: <ForumIcon />, action: () => navigate('/forum') },
        { text: 'Profile', icon: <AccountCircleIcon />, action: () => navigate('/profile') },
        { text: 'Logout', icon: <LogoutIcon />, action: handleLogout },
        { text: 'Chatbot', icon: <ChatIcon />, action: toggleChatbot }
      ].map((item, index) => (
        <ListItemButton key={index} onClick={item.action}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
      <Divider />
    </List>
  );
};

interface DashboardProps {
  messageParser: ({ chatId }: { chatId: any; }) => Element;
}

const Dashboard: React.FC<DashboardProps> = ({ messageParser }) => {
  interface CustomUser extends User {
    role: string;
  }
  
  const [user, setUser] = useState<null | undefined | CustomUser>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const fetchAndSetUserProfile = async () => {
        try {
          const userProfile = await (dispatch as Dispatch)(fetchUserProfile()).unwrap();
          const customUser: CustomUser = {
            ...firebaseUser,
            role: userProfile.role, // Ensure 'role' is obtained from the userProfile
          };
          setUser(customUser);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          setUser(null);
        }
      };

      fetchAndSetUserProfile();
    } else {
      setUser(null);
      navigate('/login');
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, [dispatch, navigate]);

  const toggleDrawer = useCallback((open) => (event) => {
    if (event.type === 'keydown' && ((event).key === 'Tab' || (event).key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  }, []);

  const toggleChatbot = useCallback(() => setChatbotVisible((v) => !v), []);

  if (loading) return <Container><CircularProgress /></Container>;

  const authorizedRoles = ['admin', 'teacher'];
  if (!user || !authorizedRoles.includes(user.role)) {
    navigate('/');
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" onClick={toggleDrawer(true)} edge="start">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="temporary" open={drawerOpen} onClose={toggleDrawer(false)} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <DrawerContent navigate={navigate} toggleChatbot={toggleChatbot} />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <AutoCorrect />
        <TextSummarization />
        <QuestionGeneration />
        {chatbotVisible && <Chatbot messageParser={MessageParser} actionProvider={ActionProvider} {...config} />}
      </Box>
    </Box>
  );
};

export default Dashboard;
