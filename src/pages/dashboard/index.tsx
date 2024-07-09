import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
    AppBar, Box, CircularProgress, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography
} from '@mui/material';
import {
    AccountCircle as AccountCircleIcon, Chat as ChatIcon, Forum as ForumIcon, Home as HomeIcon,
    Logout as LogoutIcon, Menu as MenuIcon, School as SchoolIcon
} from '@mui/icons-material';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import AutoCorrect from '../../components/AI/AutoCorrect';
import QuestionGeneration from '../../components/AI/QuestionGeneration';
import TextSummarization from '../../components/AI/TextSummarization';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { User } from '../../interfaces/types';

const drawerWidth = 240;

interface NavItem {
  action: any;
  text: string;
  icon: React.ReactElement;
  href: string;
  roles?: ('student' | 'teacher' | 'supervisor')[]
}

const DrawerContent = ({ navigate, toggleChatbotVisibility }: { navigate: (path: string) => void, toggleChatbotVisibility: React.MouseEventHandler<HTMLButtonElement> }) => {
  const { user } = useAuth();

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/');
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  const drawerItems: NavItem[] = [
    {
        text: 'Home', icon: <HomeIcon />, href: '/',
        action: undefined
    },
    {
        text: 'Courses', icon: <SchoolIcon />, href: '/courses', roles: ['student', 'teacher'],
        action: undefined
    },
    {
        text: 'Forum', icon: <ForumIcon />, href: '/forums', roles: ['student', 'teacher'],
        action: undefined
    },
    {
        text: 'Profile', icon: <AccountCircleIcon />, href: '/profile',
        action: undefined
    },
    { text: 'Logout', icon: <LogoutIcon />, href: '#', action: handleLogout },
    { text: 'Chatbot', icon: <ChatIcon />, href: '#', action: toggleChatbotVisibility },
  ];

  return (
    <List>
      {drawerItems.map((item) => {
        if (item.roles && !item.roles.includes(user?.user_type as "student" | "teacher" | "supervisor")) {
          return null;
        }

        if (item.action) {
          return (
            <ListItemButton key={item.text} onClick={item.action}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          );
        }

        return (
          <ListItemButton key={item.text} component={Link} href={item.href} passHref>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        );
      })}
    </List>
  );
};

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const fetchUserRole = async () => {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data(), displayName: firebaseUser.displayName || '', role: '', id: '', name: '', photoURL: firebaseUser.photoURL || '' });
          }
          setLoading(false);
        };
        fetchUserRole();
      } else {
        setUser(null);
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      if (user.user_type === 'student') {
        router.push('/courses');
      } else {
        router.push('/dashboard/courses');
      }
    }
  }, [user, router]);

  const toggleDrawer = (open: boolean | ((prevState: boolean) => boolean)) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLButtonElement>) => {
    if ((event as React.KeyboardEvent<HTMLButtonElement>).type === 'keydown' && ((event as React.KeyboardEvent<HTMLButtonElement>).key === 'Tab' || (event as React.KeyboardEvent<HTMLButtonElement>).key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const toggleChatbotVisibility = useCallback(() => {
    setChatbotVisible((prevVisibility) => !prevVisibility);
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" onClick={(event: React.MouseEvent<HTMLButtonElement>) => toggleDrawer(true)(event)} edge="start">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        <DrawerContent navigate={router.push} toggleChatbotVisibility={toggleChatbotVisibility} />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <AutoCorrect />
        <TextSummarization />
        <QuestionGeneration />
        {chatbotVisible && <div>Chatbot Component</div>}
      </Box>
    </Box>
  );
};

export default Dashboard;
