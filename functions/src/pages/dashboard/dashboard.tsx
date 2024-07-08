import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
    AppBar,
    Box,
    CircularProgress,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography} from '@mui/material';
import {
    AccountCircle as AccountCircleIcon,
    Chat as ChatIcon,
    Forum as ForumIcon,
    Home as HomeIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth'; 
import { auth, db } from '../../firebaseConfig'; 
import { doc, getDoc } from 'firebase/firestore';
import AutoCorrect from '../../components/AI/AutoCorrect';
import QuestionGeneration from '../../components/AI/QuestionGeneration';
import TextSummarization from '../../components/AI/TextSummarization';

const drawerWidth = 240;

const DrawerContent = ({ navigate, toggleChatbotVisibility }: { navigate: (path: string) => void, toggleChatbotVisibility: () => void }) => {
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
                { text: 'Forum', icon: <ForumIcon />, action: () => navigate('/forums') },
                { text: 'Profile', icon: <AccountCircleIcon />, action: () => navigate('/profile') },
                { text: 'Logout', icon: <LogoutIcon />, action: handleLogout },
                { text: 'Chatbot', icon: <ChatIcon />, action: toggleChatbotVisibility }, 
            ].map((item, index) => (
                <ListItemButton key={index} onClick={item.action}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                </ListItemButton>
            ))}
        </List>
    );
};

interface UserRole {
  role: "student" | "teacher" | "supervisor";
}

interface DashboardUser extends FirebaseUser, UserRole {
}

const Dashboard = () => {
    const [user, setUser] = useState<DashboardUser | null>(null); 
    const [loading, setLoading] = useState(true); 
    const [drawerOpen, setDrawerOpen] = useState(false); 
    const router = useRouter(); 
    const [chatbotVisible, setChatbotVisible] = useState(false); 
    const toggleChatbotVisibility = useCallback(() => {
        setChatbotVisible(prevState => !prevState);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user data from Firestore 
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists()) {
                      const userData = docSnap.data() as UserRole; 
                      const customUser: DashboardUser = {
                          ...firebaseUser, 
                          role: userData.role, 
                      };
                      setUser(customUser); 
                    } else {
                      // Handle cases where user data is not found in Firestore. 
                      // You might create a new document or sign the user out.
                      console.log('User data not found in Firestore.');
                    }
                }).catch((error) => {
                    // Handle error fetching user data
                    console.error('Error getting user document:', error); 
                    router.push('/error');  // Or display an error message
                }).finally(() => {
                  setLoading(false);
                });
            } else {
              // User is not logged in
              setUser(null);
              router.push('/login');  
            }
        });

        // Clean up listener on component unmount
        return () => unsubscribe();
    }, [router]); 

    const toggleDrawer = useCallback((open: boolean | ((prevState: boolean) => boolean)) => (event: React.MouseEvent<HTMLButtonElement>) => {
        if ((event as unknown as React.KeyboardEvent<HTMLButtonElement>).type === 'keydown' && ((event as unknown as React.KeyboardEvent<HTMLButtonElement>).key === 'Tab' || (event as unknown as React.KeyboardEvent<HTMLButtonElement>).key === 'Shift')) {
            return;
        }
        setDrawerOpen(open); 
    }, []);

    if (loading) {
        // You can use a loading indicator or a placeholder
        return <CircularProgress />;
    }

    // User not found or not logged in
    if (!user) {
        return null; 
    }

    // Redirect unauthorized users (not admin or teacher) to homepage
    const authorizedRoles = ['admin', 'teacher']; 
    if (!authorizedRoles.includes(user.role)) { 
      router.push('/');
      return null; 
    }

    return (
        <Box sx={{ display: 'flex' }}>
            {/* App Bar  */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                <IconButton color="inherit" aria-label="open drawer" onClick={(event: React.MouseEvent<HTMLButtonElement>) => toggleDrawer(true)(event)} edge="start" >
                    <MenuIcon /> 
                  </IconButton> 
                  <Typography variant="h6" component="div">
                    Dashboard 
                  </Typography> 
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer 
                variant="temporary"
                open={drawerOpen} 
                onClose={toggleDrawer(false)} 
                sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }} 
            >
                <DrawerContent navigate={router.push} toggleChatbotVisibility={toggleChatbotVisibility}  /> 
            </Drawer>

            {/* Main Content  */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {/* Add your AI components, or use conditional rendering based on route */}
                <AutoCorrect />
                <TextSummarization />
                <QuestionGeneration />
                {chatbotVisible && <div>Chatbot Component</div>}
            </Box>
        </Box>
    );
}; 

export default Dashboard;