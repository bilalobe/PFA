import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Grid } from '@mui/material';
import { PlayCircleFilled, PanTool, Chat, People, NoteAlt, WifiOff, CloudDone } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreCollectionData, useFirestoreDocument } from '../../hooks/useFirestore';
import { db } from '../../firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import LiveSessionChat from './LiveSessionChat';
import LiveSessionParticipantsPanel from './LiveSessionParticipantsPanel';
import SessionNotes from './SessionNotes';
import { 
  subscribeToLiveSession, 
  initLiveSessionSocket,
  signalHandRaise,
  updateParticipantPresence,
  cleanupLiveSessionSubscriptions
} from '../../services/liveSessionService';
import { getCachedSession, getCachedUpcomingSessions, prefetchAndCacheUpcomingSessions } from '../../services/sessionsCache';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { query, collection, where, orderBy } from 'firebase/firestore';
import enrollmentApi from '../../services/enrollmentApi';

interface StudentSessionViewerProps {
  courseId: string;
}

const StudentSessionViewer: React.FC<StudentSessionViewerProps> = ({ courseId }) => {
  const { user } = useAuth();
  const { isOnline, wasOffline } = useNetworkStatus();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cachedSessions, setCachedSessions] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Query for live sessions, use cached data when offline
  const sessionsQuery = query(
    collection(db, 'liveSessions'),
    where('courseId', '==', courseId),
    where('status', 'in', ['scheduled', 'live']),
    orderBy('scheduledStartTime', 'asc')
  );
  const { data: availableSessions, loading: sessionsLoading, error: sessionsError } = 
    useFirestoreCollectionData(sessionsQuery);

  // Fetch the specific active session document
  const { docData: activeSession, loading: activeSessionLoading, error: activeSessionError } =
    useFirestoreDocument(activeSessionId ? `liveSessions/${activeSessionId}` : null);

  // Fetch active poll
  const activePollId = activeSession?.activePollId;
  const { docData: currentPoll, loading: pollLoading, error: pollError } =
    useFirestoreDocument(
      activeSessionId && activePollId ? `liveSessions/${activeSessionId}/polls/${activePollId}` : null
    );

  // Load cached sessions when offline
  useEffect(() => {
    const loadCachedSessions = async () => {
      const cached = await getCachedUpcomingSessions(courseId);
      if (!isOnline) {
        setCachedSessions(cached);
      }
    };
    
    loadCachedSessions();
  }, [isOnline, courseId]);

  // Sync after coming back online
  useEffect(() => {
    if (wasOffline && isOnline) {
      setIsSyncing(true);
      prefetchAndCacheUpcomingSessions(courseId).then(() => {
        setIsSyncing(false);
      });
    }
  }, [wasOffline, isOnline, courseId]);

  // Cache sessions for offline use
  useEffect(() => {
    if (isOnline && availableSessions?.length > 0) {
      prefetchAndCacheUpcomingSessions(courseId);
    }
  }, [availableSessions, isOnline, courseId]);

  // Initialize socket when joining a live session
  useEffect(() => {
    if (activeSessionId && user?.uid && isOnline) {
      // Initialize socket connection
      initLiveSessionSocket(user.uid);
      
      // Update presence
      updateParticipantPresence(activeSessionId, user.uid, true);
      
      // Set up cleanup
      return () => {
        updateParticipantPresence(activeSessionId, user.uid, false);
        cleanupLiveSessionSubscriptions();
      };
    }
  }, [activeSessionId, user?.uid, isOnline]);

  // Auto-enroll in course if joining a session directly from a shared link
  useEffect(() => {
    const handleAutoEnroll = async () => {
      if (user && activeSession && !isEnrolled) {
        try {
          await enrollmentApi.enrollInCourse(activeSession.courseId);
          setIsEnrolled(true);
          // Show confirmation toast
        } catch (error) {
          console.error('Error auto-enrolling:', error);
        }
      }
    };
    
    if (activeSession && !isEnrolled) {
      handleAutoEnroll();
    }
  }, [activeSession, isEnrolled, user]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTabIndex(newValue);
  };

  // Handle raising/lowering hand
  const handleToggleHand = () => {
    if (activeSessionId && user?.uid) {
      signalHandRaise(activeSessionId, user.uid, !isHandRaised);
      setIsHandRaised(!isHandRaised);
    }
  };

  const isLoading = sessionsLoading || (activeSessionId && activeSessionLoading);
  const displayError = sessionsError?.message || activeSessionError?.message || actionError;

  if (isLoading && (!availableSessions || availableSessions.length === 0) && !activeSession) {
    return <CircularProgress />;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Live Sessions</Typography>
      {displayError && <Alert severity="error" sx={{ mb: 2 }}>{displayError}</Alert>}

      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <WifiOff /> You are offline. Displaying cached sessions.
        </Alert>
      )}

      {isSyncing && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <CloudDone /> Syncing sessions after reconnecting...
        </Alert>
      )}

      {activeSessionId && activeSession && activeSession.status === 'live' && (
        <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
          <Typography variant="h6" color="primary">Joined: {activeSession.title}</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
            <Button
              variant={isHandRaised ? "contained" : "outlined"}
              color={isHandRaised ? "primary" : "secondary"}
              startIcon={<PanTool />}
              onClick={handleToggleHand}
              sx={{ mr: 2 }}
            >
              {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            </Button>
            
            <Tabs 
              value={activeTabIndex} 
              onChange={handleTabChange}
              aria-label="session tabs"
            >
              <Tab icon={<Chat />} label="Chat" />
              <Tab icon={<People />} label="Participants" />
              <Tab icon={<NoteAlt />} label="Notes" />
            </Tabs>
          </Box>
          
          <Box sx={{ my: 2, height: 400 }}>
            {activeTabIndex === 0 && user && (
              <LiveSessionChat 
                sessionId={activeSessionId} 
                userId={user.uid} 
                displayName={user.displayName || 'Anonymous'}
              />
            )}
            
            {activeTabIndex === 1 && user && (
              <LiveSessionParticipantsPanel 
                sessionId={activeSessionId}
                currentUserId={user.uid}
              />
            )}

            {activeTabIndex === 2 && user && (
              <SessionNotes 
                sessionId={activeSessionId}
                userId={user.uid}
              />
            )}
          </Box>

          <Button
            variant="outlined"
            size="small"
            color="secondary"
            onClick={() => setActiveSessionId(null)}
            disabled={actionLoading}
            sx={{ mt: 2 }}
          >
            Leave Session
          </Button>
        </Box>
      )}

      {!activeSessionId && (
        <List>
          {(!availableSessions || availableSessions.length === 0) && !sessionsLoading && (
            <ListItem>
              <ListItemText primary="No upcoming or live sessions." />
            </ListItem>
          )}
          {availableSessions && availableSessions.map((session) => (
            <ListItem key={session.id} divider>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <ListItemText
                    primary={session.title}
                    secondary={`Starts: ${session.scheduledStartTime?.toDate ? session.scheduledStartTime.toDate().toLocaleString() : 'Invalid Date'}`}
                  />
                </Grid>
                <Grid item xs={12} sm={4} container justifyContent="flex-end">
                  {session.status === 'live' && (
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={<PlayCircleFilled />}
                      onClick={() => setActiveSessionId(session.id)}
                      disabled={actionLoading || sessionsLoading}
                    >
                      Join Live
                    </Button>
                  )}
                  {session.status === 'scheduled' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setActiveSessionId(session.id)}
                      disabled={actionLoading || sessionsLoading}
                    >
                      Join Waiting Room
                    </Button>
                  )}
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default StudentSessionViewer;