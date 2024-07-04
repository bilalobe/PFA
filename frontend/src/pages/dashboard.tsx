import React, { useEffect, useState, useCallback, useMemo, Suspense, lazy, LazyExoticComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import {
  AppBar,
  Box,
  CircularProgress,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Chat as ChatIcon,
  Forum as ForumIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, DocumentData } from 'firebase/firestore';
import { fetchUserProfile } from '@/types/features/user/userSlice';
import { auth, db } from '../../../firebaseConfig';
import ErrorBoundary from '@/types/middleware/ErrorBoundary';

const ChatbotContainer = lazy(() => import('@/components/AI/ChatbotContainer'));
const AutoCorrect = lazy(() => import('@/components/AI/AutoCorrect'));
const QuestionGeneration = lazy(() => import('@/components/AI/QuestionGeneration'));
const TextSummarization = lazy(() => import('@/components/AI/TextSummarization'));
const ActionProvider = lazy(() => import('@/components/AI/ActionProvider'));
const MessageParser = lazy(() => import('@/components/AI/MessageParser'));

const drawerWidth = 240;

interface DrawerContentProps {
  toggleChatbot: () => void;
}

const DrawerContent: React.FC<DrawerContentProps> = ({ toggleChatbot }) => {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, [router]);

  const drawerItems = useMemo(() => [
    { text: 'Home', icon: <HomeIcon />, href: '/' },
    { text: 'Courses', icon: <SchoolIcon />, href: '/courses' },
    { text: 'Forum', icon: <ForumIcon />, href: '/forums' },
    { text: 'Profile', icon: <AccountCircleIcon />, href: '/profile' },
    { text: 'Logout', icon: <LogoutIcon />, action: handleLogout },
    { text: 'Chatbot', icon: <ChatIcon />, action: toggleChatbot },
  ], [handleLogout, toggleChatbot]);

  return (
    <List>
      {drawerItems.map((item, index) => (
        <ListItemButton key={index} onClick={item.action ? item.action : () => router.push(item.href || '/')}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
      <Divider />
    </List>
  );
};

interface DashboardProps {
  messageParser: LazyExoticComponent<({ chatId }: { chatId: string | number }) => JSX.Element>;
  welcomeMessage: string;
  notRecognizedMessage: string;
  autoResponseDelay: number;
  timeoutMessage: string;
  actionProvider: LazyExoticComponent<any>;
}

interface CustomUser extends FirebaseUser {
  role: string;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const [user, setUser] = useState<null | CustomUser>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [recommendations, setRecommendations] = useState<DocumentData[]>([]);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const actionResult = await dispatch(fetchUserProfile() as any);
          const userProfile = actionResult.payload;
          const customUser: CustomUser = {
            ...firebaseUser,
            role: userProfile.role,
          };
          setUser(customUser);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          setUser(null);
        }
      } else {
        setUser(null);
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch, router]);

  useEffect(() => {
    const q = query(collection(db, process.env.NEXT_PUBLIC_RECOMMENDATIONS_COLLECTION || 'recommendations'), orderBy('rating', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setRecommendations(querySnapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(collection(db, process.env.NEXT_PUBLIC_SENTIMENT_COLLECTION || 'sentimentData'), 'latest'),
      (doc) => {
        if (doc.exists()) {
          setSentimentData(doc.data());
        } else {
          console.log("No such document!");
        }
      }
    );
    return () => unsubscribe();
  }, []);

  const toggleDrawer = useCallback((open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  }, []);

  const toggleChatbot = useCallback(() => setChatbotVisible((v) => !v), []);

  if (loading) return <Container><CircularProgress /></Container>;

  const authorizedRoles = ['admin', 'teacher'];
  if (!user || !authorizedRoles.includes(user.role)) {
    router.push('/');
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
          <DrawerContent toggleChatbot={toggleChatbot} />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Suspense fallback={<CircularProgress />}>
          <AutoCorrect />
          <TextSummarization />
          <QuestionGeneration />
        </Suspense>
        <Typography variant="h5" gutterBottom>
          Personalized Recommendations
        </Typography>
        {recommendations.map((recommendation) => (
          <Box key={recommendation.id} sx={{ mb: 2 }}>
            <Typography variant="h6">{recommendation.name}</Typography>
            <Typography variant="body1">{recommendation.description}</Typography>
            <Typography variant="overline" display="block">{recommendation.category}</Typography>
            <Typography variant="caption" display="block">Rating: {recommendation.rating}</Typography>
          </Box>
        ))}
        <Typography variant="h5" gutterBottom>
          Sentiment Analysis
        </Typography>
        {sentimentData ? (
          <Typography variant="body1">Latest Sentiment: {sentimentData.sentiment}</Typography>
        ) : (
          <Typography variant="body2">No sentiment data available.</Typography>
        )}
        {chatbotVisible && (
          <Suspense fallback={<CircularProgress />}>
            <ChatbotContainer /> 
          </Suspense>
        )}
      </Box>
    </Box>
  );
}

const DashboardApp: React.FC = () => (
  <ErrorBoundary fallback={<div>Something went wrong.</div>}>
    <Dashboard
      welcomeMessage="Welcome to the dashboard"
      notRecognizedMessage="Sorry, I didn't understand that."
      autoResponseDelay={1000}
      timeoutMessage="Are you still there?"
      actionProvider={ActionProvider}
      messageParser={MessageParser}
    />
  </ErrorBoundary>
);

export default DashboardApp;
